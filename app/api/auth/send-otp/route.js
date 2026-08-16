import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import { encryptRegistration } from "@/lib/pending-registration";

const ALLOWED_DOMAIN = "gmail.com";
const OTP_EXPIRY_MINUTES = 10;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      department,
      designation,
      employeeId,
      dob,
      joiningDate,
      password,
    } = body;

    // --------------------------------
    // 1. Validate required fields
    // --------------------------------

    if (
      !firstName ||
      !lastName ||
      !email ||
      !department ||
      !designation ||
      !employeeId ||
      !dob ||
      !joiningDate ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 2. Validate email domain
    // --------------------------------

    const normalizedEmail = email.trim().toLowerCase();
    const emailDomain = normalizedEmail.split("@")[1];

    if (emailDomain !== ALLOWED_DOMAIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Only company email addresses are allowed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 3. Validate password
    // --------------------------------

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password should be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 4. Generate OTP
    // --------------------------------

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // --------------------------------
    // 5. Prepare temporary registration
    // --------------------------------
    //
    // This data will be encrypted and stored
    // inside an HTTP-only cookie.
    //
    // It will NOT be stored in employees
    // and will NOT be stored in Firestore.

    const pendingRegistration = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      department,
      designation: designation.trim(),
      employeeId: employeeId.trim(),
      dob,
      joiningDate,
      password,
    };

    // --------------------------------
    // 6. Store ONLY OTP information
    //    in Firestore
    // --------------------------------

    const otpDoc = adminDb
      .collection("pendingOtps")
      .doc(normalizedEmail);

    await otpDoc.set({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });

    // --------------------------------
    // 7. Send OTP email
    // --------------------------------

    await transporter.sendMail({
      from: `"Employee Registration" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your Registration Verification Code",

      text: `
Your employee registration verification code is: ${otp}

This code will expire in ${OTP_EXPIRY_MINUTES} minutes.

If you did not request this registration, you can safely ignore this email.
      `.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 16px;
          text-align: center;
        ">

          <h2 style="
            color: #0c108c;
            margin-bottom: 20px;
          ">
            Verify Your Email
          </h2>

          <p style="
            color: #444;
            font-size: 15px;
          ">
            Your employee registration verification code is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #0c108c;
            margin: 25px 0;
          ">
            ${otp}
          </div>

          <p style="
            color: #666;
            font-size: 13px;
          ">
            This code will expire in ${OTP_EXPIRY_MINUTES} minutes.
          </p>

          <p style="
            color: #888;
            font-size: 12px;
            margin-top: 25px;
          ">
            If you did not request this registration,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });

    // --------------------------------
    // 8. Encrypt registration data
    // --------------------------------
    //
    // The password and employee information
    // are stored only inside this encrypted,
    // HTTP-only cookie.
    //
    // JavaScript running in the browser cannot
    // read this cookie.

    const registrationToken = encryptRegistration(
      pendingRegistration
    );

    const cookieStore = await cookies();

    cookieStore.set(
      "pending_registration",
      registrationToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: OTP_EXPIRY_MINUTES * 60,
      }
    );

    // --------------------------------
    // 9. Return success
    // --------------------------------

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}
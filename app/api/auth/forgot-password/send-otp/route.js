import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { adminDb } from "@/firebase/admin";
import { generateOTP, hashOTP } from "@/lib/otp";
import { encryptRegistration } from "@/lib/pending-registration";

const OTP_EXPIRY_MINUTES = 10;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please enter your email address." },
        { status: 400 }
      );
    }

    // --------------------------------
    // 1. Confirm account exists.
    //    Done here (server side, Admin SDK) instead of the client,
    //    because the client is not authenticated at this point and
    //    the "employees" Firestore rules require request.auth != null.
    // --------------------------------

    const employeeQuery = await adminDb
      .collection("employees")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (employeeQuery.empty) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // --------------------------------
    // 2. Generate + store OTP (hashed, own collection so it can't
    //    collide with registration OTPs)
    // --------------------------------

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await adminDb.collection("passwordResetOtps").doc(email).set({
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });

    // --------------------------------
    // 3. Email the code
    // --------------------------------

    await transporter.sendMail({
      from: `"Employee Portal Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      text: `Your password reset verification code is: ${otp}\n\nThis code will expire in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request a password reset, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 30px; border: 1px solid #eee; border-radius: 16px; text-align: center;">
          <h2 style="color: #0c108c; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #444; font-size: 15px;">Your password reset verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0c108c; margin: 25px 0;">${otp}</div>
          <p style="color: #666; font-size: 13px;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #888; font-size: 12px; margin-top: 25px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    // --------------------------------
    // 4. Encrypted, httpOnly session cookie carrying only the email
    //    (mirrors the pending_registration pattern)
    // --------------------------------

    const sessionToken = encryptRegistration({ email, verified: false });
    const cookieStore = await cookies();

    cookieStore.set("password_reset_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: OTP_EXPIRY_MINUTES * 60,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD SEND OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

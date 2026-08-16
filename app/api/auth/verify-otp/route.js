import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/firebase/admin";
import { decryptRegistration } from "@/lib/pending-registration";

function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export async function POST(request) {
  console.log("========================================");
  console.log("VERIFY OTP API CALLED");
  console.log("========================================");

  try {
    const body = await request.json();

    console.log("VERIFY OTP BODY:", body);

    const otp = String(body.otp || "").trim();

    // --------------------------------
    // 1. Validate OTP
    // --------------------------------

    if (!/^\d{6}$/.test(otp)) {
      console.log("INVALID OTP FORMAT");

      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit OTP.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 2. Get cookies
    // --------------------------------

    const cookieStore = await cookies();

    const registrationToken = cookieStore.get(
      "pending_registration"
    )?.value;

    console.log(
      "PENDING REGISTRATION COOKIE EXISTS:",
      !!registrationToken
    );

    if (!registrationToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your registration session has expired. Please register again.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 3. Decrypt registration
    // --------------------------------

    let registration;

    try {
      registration =
        decryptRegistration(registrationToken);

      console.log(
        "REGISTRATION DECRYPTED:",
        {
          email: registration.email,
          employeeId: registration.employeeId,
        }
      );
    } catch (error) {
      console.error(
        "REGISTRATION DECRYPT ERROR:",
        error
      );

      cookieStore.delete(
        "pending_registration"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Your registration session is invalid. Please register again.",
        },
        { status: 400 }
      );
    }

    const email = registration.email
      .trim()
      .toLowerCase();

    // --------------------------------
    // 4. Find OTP
    // --------------------------------

    console.log(
      "LOOKING FOR OTP DOCUMENT:",
      email
    );

    const otpRef = adminDb
      .collection("pendingOtps")
      .doc(email);

    const otpSnapshot = await otpRef.get();

    console.log(
      "OTP DOCUMENT EXISTS:",
      otpSnapshot.exists
    );

    if (!otpSnapshot.exists) {
      cookieStore.delete(
        "pending_registration"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const otpData = otpSnapshot.data();

    // --------------------------------
    // 5. Check expiration
    // --------------------------------

    const expiresAt =
      otpData.expiresAt?.toDate
        ? otpData.expiresAt.toDate()
        : new Date(otpData.expiresAt);

    if (new Date() > expiresAt) {
      console.log("OTP EXPIRED");

      await otpRef.delete();

      cookieStore.delete(
        "pending_registration"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 6. Compare OTP
    // --------------------------------

    const submittedHash = hashOTP(otp);

    const hashesMatch =
      submittedHash === otpData.otpHash;

    console.log(
      "OTP MATCH:",
      hashesMatch
    );

    if (!hashesMatch) {
      const attempts =
        (otpData.attempts || 0) + 1;

      if (attempts >= 5) {
        await otpRef.delete();

        cookieStore.delete(
          "pending_registration"
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Too many incorrect attempts. Please register again.",
          },
          { status: 429 }
        );
      }

      await otpRef.update({
        attempts,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Incorrect verification code.",
        },
        { status: 400 }
      );
    }

    console.log("OTP VERIFIED SUCCESSFULLY");

    // --------------------------------
    // 7. Check existing Firebase user
    // --------------------------------

    let existingUser = null;

    try {
      existingUser =
        await adminAuth.getUserByEmail(email);
    } catch (error) {
      if (
        error.code !==
        "auth/user-not-found"
      ) {
        throw error;
      }
    }

    if (existingUser) {
      console.log(
        "FIREBASE USER ALREADY EXISTS:",
        existingUser.uid
      );

      await otpRef.delete();

      cookieStore.delete(
        "pending_registration"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------
    // 8. CREATE FIREBASE AUTH USER
    // --------------------------------

    console.log(
      "CREATING FIREBASE AUTH USER..."
    );

    const userRecord =
      await adminAuth.createUser({
        email: registration.email,
        password: registration.password,
        emailVerified: true,
        displayName:
          `${registration.firstName} ${registration.lastName}`,
      });

    console.log(
      "FIREBASE USER CREATED:",
      userRecord.uid
    );

    // --------------------------------
    // 9. CREATE EMPLOYEE DOCUMENT
    // --------------------------------

    console.log(
      "CREATING EMPLOYEE FIRESTORE DOCUMENT..."
    );

    const employeeRef = adminDb
      .collection("employees")
      .doc(userRecord.uid);

    await employeeRef.set({
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      department: registration.department,
      designation: registration.designation,
      employeeId: registration.employeeId,
      dob: registration.dob,
      joiningDate: registration.joiningDate,

      emailVerified: true,

      createdAt: new Date(),
    });

    console.log(
      "EMPLOYEE FIRESTORE DOCUMENT CREATED:",
      userRecord.uid
    );

    // --------------------------------
    // 10. Verify document exists
    // --------------------------------

    const employeeSnapshot =
      await employeeRef.get();

    console.log(
      "EMPLOYEE DOCUMENT EXISTS AFTER WRITE:",
      employeeSnapshot.exists
    );

    if (!employeeSnapshot.exists) {
      throw new Error(
        "Employee document was not found after Firestore write."
      );
    }

    // --------------------------------
    // 11. Delete OTP
    // --------------------------------

    await otpRef.delete();

    console.log(
      "OTP DOCUMENT DELETED"
    );

    // --------------------------------
    // 12. Delete registration cookie
    // --------------------------------

    cookieStore.delete(
      "pending_registration"
    );

    console.log(
      "REGISTRATION COOKIE DELETED"
    );

    // --------------------------------
    // 13. SUCCESS
    // --------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "REGISTRATION COMPLETED SUCCESSFULLY"
    );

    console.log(
      "UID:",
      userRecord.uid
    );

    console.log(
      "EMAIL:",
      registration.email
    );

    console.log(
      "========================================"
    );

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message:
        "Registration completed successfully.",
    });

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "VERIFY OTP ERROR:"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while verifying your code.",
      },
      { status: 500 }
    );
  }
}
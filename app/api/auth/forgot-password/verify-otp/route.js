import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/firebase/admin";
import { hashOTP } from "@/lib/otp";
import { encryptRegistration, decryptRegistration } from "@/lib/pending-registration";

export async function POST(request) {
  try {
    const body = await request.json();
    const otp = String(body.otp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 6-digit OTP." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("password_reset_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Your reset session has expired. Please start again." },
        { status: 400 }
      );
    }

    let session;
    try {
      session = decryptRegistration(sessionToken);
    } catch (error) {
      cookieStore.delete("password_reset_session");
      return NextResponse.json(
        { success: false, message: "Your reset session is invalid. Please start again." },
        { status: 400 }
      );
    }

    const email = session.email.trim().toLowerCase();

    const otpRef = adminDb.collection("passwordResetOtps").doc(email);
    const otpSnapshot = await otpRef.get();

    if (!otpSnapshot.exists) {
      cookieStore.delete("password_reset_session");
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const otpData = otpSnapshot.data();
    const expiresAt = otpData.expiresAt?.toDate ? otpData.expiresAt.toDate() : new Date(otpData.expiresAt);

    if (new Date() > expiresAt) {
      await otpRef.delete();
      cookieStore.delete("password_reset_session");
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashesMatch = hashOTP(otp) === otpData.otpHash;

    if (!hashesMatch) {
      const attempts = (otpData.attempts || 0) + 1;

      if (attempts >= 5) {
        await otpRef.delete();
        cookieStore.delete("password_reset_session");
        return NextResponse.json(
          { success: false, message: "Too many incorrect attempts. Please start again." },
          { status: 429 }
        );
      }

      await otpRef.update({ attempts });
      return NextResponse.json(
        { success: false, message: "Incorrect verification code." },
        { status: 400 }
      );
    }

    // OTP correct — consume it, and re-issue the session cookie marked
    // "verified" so the reset-password step can trust it without the
    // OTP being usable a second time.
    await otpRef.delete();

    const verifiedToken = encryptRegistration({ email, verified: true });
    cookieStore.set("password_reset_session", verifiedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 10 * 60,
    });

    return NextResponse.json({ success: true, message: "Code verified." });
  } catch (error) {
    console.error("FORGOT PASSWORD VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while verifying your code." },
      { status: 500 }
    );
  }
}

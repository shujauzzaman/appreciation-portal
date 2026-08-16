import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/admin";
import { decryptRegistration } from "@/lib/pending-registration";

export async function POST(request) {
  try {
    const body = await request.json();
    const newPassword = String(body.newPassword || "");

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password should be at least 6 characters." },
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

    if (!session.verified) {
      return NextResponse.json(
        { success: false, message: "Please verify your code before setting a new password." },
        { status: 400 }
      );
    }

    const email = session.email.trim().toLowerCase();

    const userRecord = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(userRecord.uid, { password: newPassword });

    cookieStore.delete("password_reset_session");

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while resetting your password." },
      { status: 500 }
    );
  }
}

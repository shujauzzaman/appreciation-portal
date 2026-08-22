// app/api/admin/users/promote/route.js
//
// Promotes an employee to role: "admin". This is a privileged action —
// the caller's OWN role is verified server-side via their Firebase ID
// token before anything is written. A client-side "isAdmin" check (as
// used elsewhere in the UI to show/hide buttons) only controls what's
// rendered; it proves nothing about who's actually calling this route,
// so the real check has to happen here.

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebase/admin";

export async function POST(request) {
  try {
    // 1. Verify the caller's identity from their Firebase ID token.
    const authHeader = request.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
    }

    let callerId;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      callerId = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    // 2. Confirm the caller is themselves an admin. Never trust a role
    // sent from the client — always re-derive it from Firestore here.
    const callerSnap = await adminDb.collection("employees").doc(callerId).get();
    if (!callerSnap.exists || callerSnap.data().role !== "admin") {
      return NextResponse.json({ error: "You don't have permission to do that." }, { status: 403 });
    }

    // 3. Validate the target.
    const body = await request.json();
    const { uid } = body || {};
    if (!uid) {
      return NextResponse.json({ error: "Missing uid." }, { status: 400 });
    }

    const targetRef = adminDb.collection("employees").doc(uid);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetSnap.data().role === "admin") {
      return NextResponse.json({ error: "User is already an admin." }, { status: 400 });
    }

    // 4. Promote.
    await targetRef.update({ role: "admin" });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error promoting user:", err);
    return NextResponse.json({ error: "Failed to promote user. Please try again." }, { status: 500 });
  }
}
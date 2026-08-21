// app/api/admin/users/delete/route.js
//
// Deletes an employee's account entirely: their Firebase Auth record AND
// their Firestore employees/{uid} doc. Like promote/route.js, the caller's
// OWN admin role is re-derived from Firestore here — never trusted from
// the client.

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

    // 2. Confirm the caller is themselves an admin.
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

    // Don't let an admin accidentally delete their own account from this
    // screen — that would lock them out with no other admin necessarily
    // available to undo it.
    if (uid === callerId) {
      return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
    }

    const targetRef = adminDb.collection("employees").doc(uid);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 4. Delete the Firebase Auth record and the Firestore doc. If the
    // Auth record is already gone (e.g. a retry after a partial failure),
    // don't let that block cleaning up the Firestore doc.
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    await targetRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Failed to delete user. Please try again." }, { status: 500 });
  }
}
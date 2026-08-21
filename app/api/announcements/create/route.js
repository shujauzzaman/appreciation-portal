// app/api/announcements/create/route.js
//
// Creates an announcement. Like the admin/users routes, the caller's OWN
// role is verified server-side via their Firebase ID token before anything
// is written — never trust an "isAdmin" flag from the client.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

    // 3. Validate the message.
    const body = await request.json();
    const message = (body?.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Missing announcement message." }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Announcement is too long." }, { status: 400 });
    }

    // 4. Create the announcement, tagged with the admin who posted it.
    const caller = callerSnap.data();
    const authorName = `${caller.firstName || ""} ${caller.lastName || ""}`.trim() || "Admin";

    const docRef = await adminDb.collection("announcements").add({
      message,
      authorId: callerId,
      authorName,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, message, authorName });
  } catch (err) {
    console.error("Error creating announcement:", err);
    return NextResponse.json({ error: "Failed to post announcement. Please try again." }, { status: 500 });
  }
}
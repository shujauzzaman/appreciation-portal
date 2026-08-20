// app/api/posts/create/route.js
//
// Creates a "recognize" or "nominate" post AND awards points to the
// recipient, all server-side via firebase-admin. This deliberately
// bypasses Firestore client security rules (which only let a user write
// their own employee doc) and, more importantly, means the client can
// never forge who the sender is or what pointsAwarded should be — both
// are derived here, not trusted from the request body.

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";
import { calculateRecognitionPoints } from "@/app/constants/points";
import { getMonthKey } from "@/lib/month-key";

export async function POST(request) {
  try {
    // 1. Verify the caller's identity from their Firebase ID token —
    // never trust a senderId passed in the request body.
    const authHeader = request.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
    }

    let senderId;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      senderId = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const body = await request.json();
    const { type, recipientId, message, level, badge } = body || {};

    if (type !== "recognize" && type !== "nominate") {
      return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
    }
    if (!recipientId) {
      return NextResponse.json({ error: "Missing recipientId." }, { status: 400 });
    }
    if (recipientId === senderId) {
      return NextResponse.json({ error: "You can't recognize yourself." }, { status: 400 });
    }
    if (type === "recognize" && !message?.trim()) {
      return NextResponse.json({ error: "Missing message." }, { status: 400 });
    }
    if (type === "nominate" && !badge) {
      return NextResponse.json({ error: "Missing badge." }, { status: 400 });
    }

    // 2. Load sender + recipient from Firestore (server-trusted data only).
    const [senderSnap, recipientSnap] = await Promise.all([
      adminDb.collection("employees").doc(senderId).get(),
      adminDb.collection("employees").doc(recipientId).get(),
    ]);

    if (!senderSnap.exists) {
      return NextResponse.json({ error: "Sender profile not found." }, { status: 404 });
    }
    if (!recipientSnap.exists) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    const sender = senderSnap.data();
    const recipient = recipientSnap.data();

    // 3. Points are calculated here — the client never sends this value.
    const { total: pointsAwarded, breakdown: pointsBreakdown } = calculateRecognitionPoints({
      type,
      sender,
      recipient,
    });

    const recipientName = `${recipient.firstName || ""} ${recipient.lastName || ""}`
      .trim()
      .toUpperCase();
    const senderName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim();

    const postData = {
      type,
      senderId,
      senderName,
      senderPhotoURL: sender.photoURL || null,
      recipientId,
      recipientName,
      recipientDepartment: recipient.department || "",
      recipientPhotoURL: recipient.photoURL || null,
      pointsAwarded,
      pointsBreakdown,
      likedBy: [],
      clapedBy: [],
      shareCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (type === "recognize") {
      postData.level = level || "Good Job!";
      postData.message = message.trim();
    } else {
      postData.badge = badge;
    }

    // 4. Create the post, then award points in two places:
    //    - employees.points: lifetime running total (unchanged behavior)
    //    - monthlyPoints/{recipientId}_{month}: this calendar month's total,
    //      so month/quarter/year leaderboard tabs can be computed from real
    //      period-scoped data instead of re-deriving it from `posts` or
    //      conflating it with the lifetime `employees.points` field.
    const postRef = await adminDb.collection("posts").add(postData);

    const monthKey = getMonthKey();
    const monthlyRef = adminDb
      .collection("monthlyPoints")
      .doc(`${recipientId}_${monthKey}`);

    await Promise.all([
      adminDb.collection("employees").doc(recipientId).update({
        points: FieldValue.increment(pointsAwarded),
      }),
      monthlyRef.set(
        {
          recipientId,
          month: monthKey,
          name: recipientName,
          photoURL: recipient.photoURL || null,
          department: recipient.department || "",
          points: FieldValue.increment(pointsAwarded),
        },
        { merge: true }
      ),
    ]);

    return NextResponse.json({ id: postRef.id, pointsAwarded, pointsBreakdown });
  } catch (err) {
    console.error("Error creating post:", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
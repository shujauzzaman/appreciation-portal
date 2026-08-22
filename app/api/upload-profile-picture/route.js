// app/api/upload-profile-picture/route.js
//
// Uploads (and overwrites) a user's profile picture. Like the other
// write routes, the caller's identity is verified server-side via their
// Firebase ID token — the uid used for the Cloudinary public_id is taken
// from the verified token, never trusted from the request body, so one
// user can't overwrite another user's photo.

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/firebase/admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // 1. Verify the caller's identity from their Firebase ID token.
    const authHeader = request.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
    }

    let uid;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Missing file." },
        { status: 400 }
      );
    }

    // Basic server-side validation (mirrors client-side checks)
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image." },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB." },
        { status: 400 }
      );
    }

    // Convert the uploaded File to a base64 data URI for the Cloudinary SDK
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Signed upload using your saved preset (appreciation-portal),
    // which already has overwrite:true and asset folder configured.
    // public_id is still passed explicitly so each user's image
    // consistently overwrites their own previous one.
    const result = await cloudinary.uploader.upload(dataUri, {
      upload_preset: "appreciation-portal",
      public_id: uid,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
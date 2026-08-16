// app/api/upload-profile-picture/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uid = formData.get("uid");

    if (!file || !uid) {
      return NextResponse.json(
        { error: "Missing file or user ID." },
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
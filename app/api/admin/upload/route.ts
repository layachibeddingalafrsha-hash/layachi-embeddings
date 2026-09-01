// Cloudinary image upload API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpg, png, webp, gif, avif" },
        { status: 400 }
      );
    }

    // Validate file size (max 30MB)
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 30MB" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary not configured" },
        { status: 500 }
      );
    }

    // Generate signature for signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "caba-italie/products";

    // Create signature string
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureStr);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Upload to Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", String(timestamp));
    uploadFormData.append("signature", signature);
    uploadFormData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("Cloudinary upload error:", uploadData);
      return NextResponse.json(
        { error: uploadData.error?.message || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      width: uploadData.width,
      height: uploadData.height,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

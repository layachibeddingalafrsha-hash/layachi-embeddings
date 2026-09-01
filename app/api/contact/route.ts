import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { sanitizeString, checkRateLimit } from "@/utils/helpers";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`contact_${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, title, message } = body;

    // Validation
    if (!name || !email || !phone || !title || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: sanitizeString(phone),
      title: sanitizeString(title),
      message: sanitizeString(message),
      createdAt: new Date(),
    };

    const { db } = await connectToDatabase();
    const result = await db.collection("contact_messages").insertOne(sanitizedData);

    return NextResponse.json({
      success: true,
      messageId: result.insertedId,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const messages = await db.collection("contact_messages").find().toArray();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in GET /contact:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
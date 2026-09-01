// Admin pages API - manage editable page content (FAQ, Shipping, Returns, Terms)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";

export const dynamic = "force-dynamic";

// Valid page slugs
const VALID_PAGES = ["faq", "shipping", "returns", "terms"];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      if (!VALID_PAGES.includes(slug)) {
        return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
      }
      const page = await db.collection("pages").findOne({ slug });
      return NextResponse.json({ page: page || null });
    }

    // Return all pages
    const pages = await db.collection("pages").find({}).toArray();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, title_ar, title_fr, content_ar, content_fr } = body;

    if (!slug || !VALID_PAGES.includes(slug)) {
      return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("pages").updateOne(
      { slug },
      {
        $set: {
          slug,
          title_ar: title_ar || "",
          title_fr: title_fr || "",
          content_ar: content_ar || "",
          content_fr: content_fr || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const page = await db.collection("pages").findOne({ slug });

    return NextResponse.json({ page, success: true });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

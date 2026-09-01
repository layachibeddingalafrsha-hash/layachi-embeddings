// Public pages API - fetch editable page content
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

export const dynamic = "force-dynamic";

const VALID_PAGES = ["faq", "shipping", "returns", "terms"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug || !VALID_PAGES.includes(slug)) {
      return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const page = await db.collection("pages").findOne({ slug });

    if (!page) {
      return NextResponse.json({ page: null });
    }

    return NextResponse.json({
      page: {
        slug: page.slug,
        title_ar: page.title_ar,
        title_fr: page.title_fr,
        content_ar: page.content_ar,
        content_fr: page.content_fr,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

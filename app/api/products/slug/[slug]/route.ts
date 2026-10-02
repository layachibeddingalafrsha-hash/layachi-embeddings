import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { db } = await connectToDatabase();
    // Next.js decodes dynamic route params, but guard against a value that
    // arrives encoded so it can never silently mismatch the stored slug.
    const slug = decodeURIComponent(params.slug);

    const product = await db.collection("products").findOne({
      slug,
      active: true,
    });

    if (!product) {
      // Distinguish "no such slug" from "exists but unpublished" so a broken
      // link is not mistaken for a deactivated product.
      const exists = await db.collection("products").findOne(
        { slug },
        { projection: { active: 1 } }
      );

      return NextResponse.json(
        {
          error: exists ? "Product is not available" : "Product not found",
          slug,
          unpublished: exists !== null && exists.active !== true,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

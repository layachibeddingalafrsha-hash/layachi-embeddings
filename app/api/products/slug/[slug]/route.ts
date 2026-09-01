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
    const { slug } = params;

    const product = await db.collection("products").findOne({                         
      slug,
      active: true,
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
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

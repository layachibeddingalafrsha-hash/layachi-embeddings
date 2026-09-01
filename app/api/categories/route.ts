import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const categories = await db
      .collection("categories")
      .find({})
      .sort({ order: 1 })
      .toArray();

    console.log('📋 Categories API response:', categories.map(c => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug
    })));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

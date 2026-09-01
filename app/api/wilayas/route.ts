import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const wilayas = await db
      .collection("wilayas")
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(wilayas);
  } catch (error) {
    console.error("Error fetching wilayas:", error);
    return NextResponse.json(
      { error: "Failed to fetch wilayas" },
      { status: 500 }
    );
  }
}

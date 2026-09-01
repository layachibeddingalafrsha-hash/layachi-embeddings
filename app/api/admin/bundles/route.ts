// Admin bundles API - Get all bundles
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const bundles = await db
      .collection("productbundles")
      .find({})
      .sort({ productId: 1, quantity: 1 })
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const serializedBundles = bundles.map((bundle) => ({
      ...bundle,
      _id: bundle._id.toString(),
      productId: bundle.productId.toString(),
    }));

    return NextResponse.json({ bundles: serializedBundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

// Admin product bundles API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const bundles = await db
      .collection("productbundles")
      .find({ productId: new ObjectId(params.id) })
      .sort({ quantity: 1 })
      .toArray();

    return NextResponse.json({ bundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    const bundle = {
      productId: new ObjectId(params.id),
      quantity: parseInt(body.quantity),
      discount: parseFloat(body.discount),
      active: body.active !== false,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("productbundles").insertOne(bundle);

    return NextResponse.json({
      success: true,
      bundle: { ...bundle, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating bundle:", error);
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }
}

// Admin bundle update/delete API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { bundleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    const updateFields: any = { updatedAt: new Date() };
    if (body.quantity !== undefined) updateFields.quantity = parseInt(body.quantity);
    if (body.discount !== undefined) updateFields.discount = parseFloat(body.discount);
    if (body.active !== undefined) updateFields.active = body.active;
    if (body.startDate !== undefined) updateFields.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateFields.endDate = body.endDate ? new Date(body.endDate) : null;

    await db.collection("productbundles").updateOne(
      { _id: new ObjectId(params.bundleId) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bundle:", error);
    return NextResponse.json({ error: "Failed to update bundle" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bundleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection("productbundles").deleteOne({ _id: new ObjectId(params.bundleId) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json({ error: "Failed to delete bundle" }, { status: 500 });
  }
}

// Admin shipping (wilayas) API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Wilayas only
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: !isNaN(parseInt(search)) ? parseInt(search) : -1 },
      ];
    }

    const wilayas = await db
      .collection("wilayas")
      .find(filter)
      .sort({ code: 1 })
      .toArray();

    return NextResponse.json({ wilayas });
  } catch (error) {
    console.error("Error fetching shipping data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updateFields: any = { updatedAt: new Date() };

    if (updateData.shipping_price_home !== undefined)
      updateFields.shipping_price_home = parseFloat(updateData.shipping_price_home) || 0;
    if (updateData.shipping_price_desk !== undefined)
      updateFields.shipping_price_desk = parseFloat(updateData.shipping_price_desk) || 0;
    if (updateData.is_active !== undefined) updateFields.is_active = updateData.is_active;
    if (updateData.delivery_to_home !== undefined)
      updateFields.delivery_to_home = updateData.delivery_to_home;
    if (updateData.delivery_to_desk !== undefined)
      updateFields.delivery_to_desk = updateData.delivery_to_desk;

    await db.collection("wilayas").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shipping data:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

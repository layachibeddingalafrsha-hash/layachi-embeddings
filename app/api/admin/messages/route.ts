// Admin contact messages API
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
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const filter: any = {};
    if (unreadOnly) filter.read = { $ne: true };

    const messages = await db
      .collection("contact_messages")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }

    const updateFields: any = { updatedAt: new Date() };
    if (updateData.read !== undefined) updateFields.read = updateData.read;
    if (updateData.replied !== undefined) updateFields.replied = updateData.replied;

    await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db.collection("contact_messages").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}

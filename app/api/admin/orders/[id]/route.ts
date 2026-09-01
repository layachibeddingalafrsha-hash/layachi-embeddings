// Admin single order API - GET, PUT, DELETE
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ORDER_DELETE_DISABLED_MESSAGE = "Order deletion is disabled. Orders must remain in history even when cancelled.";

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
    const order = await db.collection("orders").findOne({ _id: new ObjectId(params.id) });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db
      .collection("orderitems")
      .find({ orderId: new ObjectId(params.id) })
      .toArray();

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
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

    const updateFields: any = { updatedAt: new Date() };

    // Status update
    if (body.status) {
      updateFields.status = body.status;

      if (body.status === "confirmed") {
        updateFields.confirmed_at = new Date();
        updateFields.confirmed_by = (session.user as any).id;
      }
      if (body.status === "delivered") {
        updateFields.delivery_date = new Date();
        updateFields.paymentStatus = "paid";
        updateFields.paid_at = new Date();
      }
      if (body.status === "cancelled") {
        updateFields.cancelled_at = new Date();
        updateFields.cancelled_by = (session.user as any).id;
        updateFields.cancellation_reason = body.cancellationReason || "OTHER";
        updateFields.cancellation_notes = body.cancellationNotes || null;
      }
      if (body.status === "shipped") {
        updateFields.shipping_date = new Date();
      }
    }

    // Other field updates
    const allowedFields = [
      "customerName", "customerPhone", "notes",
      "paymentStatus", "responded", "client_responded",
      "tracking_number", "delivery_order_id", "delivery_status", "delivery_situation",
      "shippingCost", "deliveryType", "commune", "address", "wilayaName",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(
      { error: ORDER_DELETE_DISABLED_MESSAGE },
      { status: 405 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

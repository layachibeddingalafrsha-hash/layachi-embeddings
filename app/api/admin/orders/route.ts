// Admin orders API - List + Create
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

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const filter: any = {};

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { _id: ObjectId.isValid(search) ? new ObjectId(search) : null },
      ].filter((f: any) => f._id !== null);

      if (filter.$or.length === 0) {
        filter.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { customerPhone: { $regex: search, $options: "i" } },
        ];
      }
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.collection("orders").find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      db.collection("orders").countDocuments(filter),
    ]);

    // Fetch order items for each order
    const orderIds = orders.map((o: any) => o._id);
    const allItems = await db
      .collection("orderitems")
      .find({ orderId: { $in: orderIds } })
      .toArray();

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      _id: order._id.toString(),
      items: allItems
        .filter((item: any) => item.orderId.toString() === order._id.toString())
        .map((item: any) => ({ ...item, _id: item._id.toString() })),
    }));

    return NextResponse.json({
      orders: ordersWithItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    const {
      customerName,
      customerPhone,
      wilayaId,
      commune,
      deliveryType,
      address,
      items,
      notes,
      status: orderStatus,
    } = body;

    if (!customerName || !customerPhone || !wilayaId || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch wilaya
    const wilayaDoc = await db.collection("wilayas").findOne({ _id: new ObjectId(wilayaId) });

    if (!wilayaDoc) {
      return NextResponse.json({ error: "Invalid wilaya" }, { status: 400 });
    }

    // Calculate shipping cost from wilaya
    const shippingCost =
      deliveryType === "to_home"
        ? wilayaDoc.shipping_price_home || 0
        : wilayaDoc.shipping_price_desk || 0;

    // Validate items and compute subtotal
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await db.collection("products").findOne({
        _id: new ObjectId(item.productId),
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const unitPrice = parseFloat(item.unitPrice) || product.price;
      const qty = parseInt(item.quantity) || 1;
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: new ObjectId(item.productId),
        productName: product.name,
        unitPrice,
        sku: item.sku || null,
        quantity: qty,
        selectedDimension: item.selectedDimension || item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        total: itemTotal,
      });
    }

    // Calculate bundle discount
    let bundleDiscount = 0;
    const bundleDetails: any[] = [];
    const now = new Date();

    const productQuantities: Record<string, number> = {};
    validatedItems.forEach((item) => {
      const pid = item.productId.toString();
      productQuantities[pid] = (productQuantities[pid] || 0) + item.quantity;
    });

    for (const [productId, totalQty] of Object.entries(productQuantities)) {
      const bundles = await db
        .collection("productbundles")
        .find({
          productId: new ObjectId(productId),
          active: true,
          quantity: { $lte: totalQty },
          $and: [
            { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
            { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
          ],
        })
        .sort({ quantity: -1 })
        .toArray();

      if (bundles.length > 0) {
        bundleDiscount += bundles[0].discount;
        bundleDetails.push({
          productId,
          bundleId: bundles[0]._id.toString(),
          quantity: bundles[0].quantity,
          discount: bundles[0].discount,
        });
      }
    }

    const total = subtotal - bundleDiscount + shippingCost;

    const orderDoc = {
      customerName,
      customerPhone,
      wilayaId: new ObjectId(wilayaId),
      wilayaName: wilayaDoc.name,
      wilayaCode: wilayaDoc.code,
      commune: commune || "",
      address: address || "",
      deliveryType,
      subtotal,
      bundleDiscount,
      bundleDetails,
      shippingCost,
      total,
      status: orderStatus || "pending",
      paymentStatus: "pending",
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("orders").insertOne(orderDoc);

    // Insert order items
    const orderItemsDocs = validatedItems.map((item) => ({
      ...item,
      orderId: result.insertedId,
      createdAt: now,
      updatedAt: now,
    }));

    await db.collection("orderitems").insertMany(orderItemsDocs);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      total,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

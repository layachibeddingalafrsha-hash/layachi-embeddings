import { connectToDatabase } from "@/utils/db";
import { checkRateLimit, sanitizeString } from "@/utils/helpers";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Note: Server-side Meta Purchase events are now handled by trackPurchase()
// in components/MetaPixel.tsx which sends to /api/meta-event with event_id
// for proper deduplication with client-side pixel events.

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`order_${ip}`, 3, 60000)) {
      return NextResponse.json(
        { error: "Too many order attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      items,
      customerName,
      customerPhone,
      wilayaId,
      commune,
      deliveryType,
      address,
    } = body;

    // Validation - required fields
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !customerName ||
      !customerPhone ||
      !wilayaId ||
      !deliveryType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Validate stock and recompute prices from server
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await db.collection("products").findOne({
        _id: new ObjectId(item.productId),
        active: true,
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      // Check stock using MongoDB fields
      if (typeof product.in_stock === 'boolean' && typeof product.stock_quantity === 'number') {
        if (!product.in_stock || product.stock_quantity <= 0) {
          return NextResponse.json(
            { error: `${product.name} is out of stock` },
            { status: 400 }
          );
        }

        if (product.stock_quantity < item.qty) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.qty}` },
            { status: 400 }
          );
        }
      } else {
        // Fallback to variant stock
        const variant = product.variants?.find((v: any) => v.sku === item.sku);
        if (!variant || variant.stock < item.qty) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          );
        }
      }

      // Use server price
      const itemTotal = product.price * item.qty;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        unitPrice: product.price,
        sku: item.sku,
        qty: item.qty,
selectedDimension: item.selectedDimension,
        selectedColor: item.selectedColor,
        total: itemTotal,
      });

      // Decrement stock - Update MongoDB stock_quantity field
      if (typeof product.stock_quantity === 'number') {
        await db.collection("products").updateOne(
          { _id: product._id },
          { 
            $inc: { stock_quantity: -item.qty },
            $set: { in_stock: product.stock_quantity - item.qty > 0 }
          }
        );
      }

      // Also update variant stock if available
      if (product.variants && item.sku) {
        await db.collection("products").updateOne(
          { _id: product._id, "variants.sku": item.sku },
          { $inc: { "variants.$.stock": -item.qty } }
        );
      }
    }

    // Fetch wilaya for shipping rate
    const wilayaDoc = await db.collection("wilayas").findOne({ 
      _id: new ObjectId(wilayaId) 
    });

    if (!wilayaDoc) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    const calculatedShippingCost =
      deliveryType === "to_home" ? (wilayaDoc.shipping_price_home || 0) : (wilayaDoc.shipping_price_desk || 0);

    // Calculate bundle discounts
    const now = new Date();
    let totalBundleDiscount = 0;
    const bundleDetails: any[] = [];

    // Group items by productId and sum quantities
    const productQuantities: {[key: string]: number} = {};
    validatedItems.forEach((item: any) => {
      const productId = item.productId.toString();
      productQuantities[productId] = (productQuantities[productId] || 0) + item.qty;
    });

    // For each product, find the best matching bundle
    for (const [productId, totalQuantity] of Object.entries(productQuantities)) {
      // Query active bundles for this product
      const bundleQuery: any = {
        productId: new ObjectId(productId),
        active: true,
        quantity: { $lte: totalQuantity },
      };

      // Add date filters
      const dateFilters: any[] = [];
      dateFilters.push({
        $or: [
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      });
      dateFilters.push({
        $or: [
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      });

      const bundles = await db.collection("productbundles")
        .find({
          ...bundleQuery,
          $and: dateFilters,
        })
        .sort({ quantity: -1 }) // Sort by quantity descending to get best match
        .toArray();

      // Apply best matching bundle (highest quantity <= order quantity)
      if (bundles.length > 0) {
        const bestBundle = bundles[0];
        totalBundleDiscount += bestBundle.discount;
        bundleDetails.push({
          productId: productId,
          bundleId: bestBundle._id.toString(),
          quantity: bestBundle.quantity,
          discount: bestBundle.discount,
        });
      }
    }

    // Calculate total: subtotal - bundleDiscount + shippingCost
    const calculatedTotal = calculatedSubtotal - totalBundleDiscount + calculatedShippingCost;

    // Create order document
    const orderDoc = {
      customerName: sanitizeString(customerName),
      customerPhone: sanitizeString(customerPhone),
      wilayaId: new ObjectId(wilayaId),
      wilayaName: wilayaDoc.name,
      wilayaCode: wilayaDoc.code,
      commune: commune ? sanitizeString(commune) : "",
      address: address ? sanitizeString(address) : "",
      deliveryType: deliveryType,
      subtotal: calculatedSubtotal,
      bundleDiscount: totalBundleDiscount,
      bundleDetails: bundleDetails,
      shippingCost: calculatedShippingCost,
      total: calculatedTotal,
      status: "pending",
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const orderResult = await db.collection("orders").insertOne(orderDoc);
    const orderId = orderResult.insertedId;

    // Create order items in separate collection
    const orderItemsToInsert = validatedItems.map(item => ({
      orderId: orderId,
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      sku: item.sku,
      quantity: item.qty,
      selectedDimension: item.selectedDimension,
      selectedColor: item.selectedColor,
      total: item.total,
      createdAt: now,
      updatedAt: now,
    }));

    await db.collection("orderitems").insertMany(orderItemsToInsert);

    // Note: Meta Purchase event is now tracked client-side via trackPurchase()
    // which sends to both client pixel and server /api/meta-event with event_id deduplication

    return NextResponse.json({
      success: true,
      orderId: orderId.toString(),
      status: "pending",
      total: calculatedTotal,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

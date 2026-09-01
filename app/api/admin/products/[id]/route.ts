// Admin single product API - GET, PUT, DELETE
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
    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Also fetch bundles for this product
    const bundles = await db
      .collection("productbundles")
      .find({ productId: new ObjectId(params.id) })
      .toArray();

    return NextResponse.json({ ...product, bundles });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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

    // If slug changed, check uniqueness
    if (body.slug) {
      const existing = await db.collection("products").findOne({
        slug: body.slug,
        _id: { $ne: new ObjectId(params.id) },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
      }
    }

    const updateFields: any = { updatedAt: new Date() };

    const allowedFields = [
      "name", "slug", "description", "price", "compareAtPrice",
      "categoryId", "images", "variants", "dimensions", "colors",
      "tags", "details", "featured", "active", "topSelling",
      "in_stock", "stock_quantity",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "price" || field === "compareAtPrice") {
          updateFields[field] = body[field] !== null && body[field] !== "" ? parseFloat(body[field]) : null;
        } else if (field === "stock_quantity") {
          updateFields[field] = parseInt(body[field]) || 0;
        } else {
          updateFields[field] = body[field];
        }
      }
    }

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    const { db } = await connectToDatabase();

    await db.collection("products").deleteOne({ _id: new ObjectId(params.id) });
    await db.collection("productbundles").deleteMany({ productId: new ObjectId(params.id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// Admin products API - Full CRUD
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";
import { resolveSlug } from "@/lib/slug";
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
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (active !== null && active !== undefined && active !== "") {
      filter.active = active === "true";
    }

    if (featured === "true") filter.featured = true;
    if (inStock === "true") filter.in_stock = true;
    if (inStock === "false") filter.in_stock = false;

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.collection("products").find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      db.collection("products").countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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

    // Pre-generate the id so names with no Latin characters (e.g. Arabic-only)
    // can still get a unique, URL-safe slug derived from it.
    const _id = new ObjectId();

    // Slugs are embedded in /products/<slug> URLs, so they must survive a URL
    // round-trip. Normalize whatever the admin typed (or derive from the name).
    const slug = resolveSlug(body.slug, body.name, _id.toString());

    if (!slug) {
      return NextResponse.json(
        { error: "Could not generate a valid slug — please provide one" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.collection("products").findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }

    const product = {
      _id,
      name: body.name,
      slug,
      description: body.description || "",
      price: parseFloat(body.price) || 0,
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
      categoryId: body.categoryId || null,
      images: body.images || [],
      variants: body.variants || [],
      dimensions: body.dimensions || [],
      colors: body.colors || [],
      tags: body.tags || [],
      details: body.details || null,
      featured: body.featured || false,
      active: body.active !== false,
      topSelling: body.topSelling || false,
      in_stock: body.in_stock !== false,
      stock_quantity: parseInt(body.stock_quantity) || 0,
      salesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      success: true,
      productId: result.insertedId.toString(),
      slug: product.slug,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortParam = searchParams.get("sort") || "topSelling";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const dimensions = searchParams.get("dimensions")?.split(",").filter(Boolean);
    const colors = searchParams.get("colors")?.split(",").filter(Boolean);
    const search = searchParams.get("search");
    const inStockOnly = searchParams.get("inStockOnly") === "true";

    // Build filter
    const filter: any = { active: true };

    if (category) {
      // Category parameter is now the category _id, not slug
      console.log('🔍 Category filter debug:', {
        categoryId: category,
        type: 'Using category _id directly'
      });
      
      try {
        // Handle both ObjectId and string types
        filter.$or = [
          { category_id: new ObjectId(category) },
          { category_id: category },
          { categoryId: new ObjectId(category) },
          { categoryId: category }
        ];
        console.log('✅ Category filter applied for category_id:', category);
      } catch (error) {
        console.error('❌ Invalid category ID format:', category);
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (dimensions && dimensions.length > 0) {
      filter.dimensions = { $in: dimensions };
    }

    if (colors && colors.length > 0) {
      filter.colors = { $in: colors };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (inStockOnly) {
      filter["variants.stock"] = { $gt: 0 };
    }

    // Build sort
    let sort: any = { topSelling: -1, salesCount: -1, createdAt: -1 };
    if (sortParam === "price_asc") {
      sort = { price: 1 };
    } else if (sortParam === "price_desc") {
      sort = { price: -1 };
    } else if (sortParam === "newest") {
      sort = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      db
        .collection("products")
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("products").countDocuments(filter),
    ]);

    console.log('📦 Products query result:', {
      filter: JSON.stringify(filter),
      totalFound: total,
      productsReturned: products.length,
      page,
      limit
    });

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

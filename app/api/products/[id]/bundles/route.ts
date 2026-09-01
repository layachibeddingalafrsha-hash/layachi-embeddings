import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[id]/bundles
 * Public endpoint to get active bundles for a product
 * Query params: ?active=true (optional, defaults to true)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Build query - default to active=true if not specified
    const query: any = { productId: new ObjectId(id) };
    if (activeParam !== null && activeParam !== undefined) {
      query.active = activeParam === 'true';
    } else {
      // Default to active bundles only for public endpoint
      query.active = true;
    }

    // Get bundles
    const bundles = await db.collection("productbundles")
      .find(query)
      .sort({ quantity: 1 }) // Sort by quantity ascending
      .toArray();

    // Filter by date validity (startDate <= now <= endDate)
    const now = new Date();
    const validBundles = bundles.filter((bundle: any) => {
      // Check start date
      if (bundle.startDate) {
        const startDate = new Date(bundle.startDate);
        if (startDate > now) return false;
      }
      
      // Check end date
      if (bundle.endDate) {
        const endDate = new Date(bundle.endDate);
        if (endDate < now) return false;
      }
      
      return true;
    });

    // Populate product info (optional, for consistency with admin API)
    const bundlesWithProduct = await Promise.all(
      validBundles.map(async (bundle: any) => {
        const product = await db.collection("products").findOne(
          { _id: bundle.productId },
          { projection: { name: 1, price: 1 } }
        );
        
        return {
          _id: bundle._id.toString(),
          productId: bundle.productId.toString(),
          quantity: bundle.quantity,
          discount: bundle.discount,
          active: bundle.active,
          startDate: bundle.startDate || null,
          endDate: bundle.endDate || null,
          created_at: bundle.created_at || null,
          updated_at: bundle.updated_at || null,
          product: product ? {
            name: product.name,
            price: product.price
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: bundlesWithProduct,
    });
  } catch (error: any) {
    console.error("Error fetching product bundles:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}


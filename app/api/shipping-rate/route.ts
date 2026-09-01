import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { ObjectId } from "mongodb";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaId = searchParams.get("wilayaId");
    const wilayaCode = searchParams.get("wilaya"); // fallback for checkout page using wilaya code
    const method = searchParams.get("method"); // "to_desk" or "to_home"

    if ((!wilayaId && !wilayaCode) || !method) {
      return NextResponse.json(
        { error: "Missing wilayaId (or wilaya code) or method parameter" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Lookup wilaya by ObjectId or by code
    let wilaya;
    if (wilayaId) {
      wilaya = await db.collection("wilayas").findOne({
        _id: new ObjectId(wilayaId),
      });
    } else if (wilayaCode) {
      wilaya = await db.collection("wilayas").findOne({
        code: parseInt(wilayaCode) || wilayaCode,
      });
      // Try string match if int didn't work
      if (!wilaya) {
        wilaya = await db.collection("wilayas").findOne({ code: wilayaCode });
      }
    }

    if (!wilaya) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    const price = method === "to_home" ? wilaya.shipping_price_home : wilaya.shipping_price_desk;

    return NextResponse.json({
      wilayaId: wilaya._id.toString(),
      wilayaName: wilaya.name,
      method,
      price: price || 0,
    });
  } catch (error) {
    console.error("Error fetching shipping rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping rate" },
      { status: 500 }
    );
  }
}

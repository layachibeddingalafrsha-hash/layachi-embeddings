// Ecom-DZ API - import wilayas with pricing
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/utils/db";

export const dynamic = "force-dynamic";

const ECOMDZ_URL = process.env.ECOMDZ_API_URL || "https://ecom-dz.net/Api_v1";
const ECOMDZ_KEY = process.env.ECOMDZ_API_KEY || "";
const ECOMDZ_TOKEN = process.env.ECOMDZ_API_TOKEN || "";

async function ecomdzFetch(endpoint: string) {
  const url = `${ECOMDZ_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Key": ECOMDZ_KEY,
      "Token": ECOMDZ_TOKEN,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ecom-DZ API error: ${response.status}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    const { db } = await connectToDatabase();

    if (action === "test") {
      // Test Ecom-DZ connection
      try {
        const data = await ecomdzFetch("/Test");
        return NextResponse.json({ success: true, message: "Connection successful", data });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
      }
    }

    if (action === "import-wilayas") {
      // Get tarification (pricing for all wilayas)
      const data = await ecomdzFetch("/Tarification");

      if (!data.Wilaya || !Array.isArray(data.Wilaya)) {
        return NextResponse.json({ error: "Invalid response from API" }, { status: 500 });
      }

      let imported = 0;
      
      for (const wilaya of data.Wilaya) {
        const code = wilaya.ID;
        const name = wilaya.Libellé;

        await db.collection("wilayas").updateOne(
          { code },
          {
            $set: {
              name,
              code,
              delivery_api_id: String(code),
              shipping_price_home: wilaya.Tarfi_Domicle || 0,
              shipping_price_desk: wilaya.Tarfi_Stopdesk || 0,
              cancellation_fee: wilaya.Tarfi_Annuler || 0,
              delivery_to_home: wilaya.Domicle || false,
              delivery_to_desk: wilaya.Stopdesk || false,
              is_active: true,
              imported_from_delivery_api: true,
              imported_at: new Date(),
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
        imported++;
      }

      return NextResponse.json({ success: true, imported, quota: data.Quota });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Ecom-DZ import error:", error);
    return NextResponse.json(
      { error: "Failed to import", message: error.message },
      { status: 500 }
    );
  }
}

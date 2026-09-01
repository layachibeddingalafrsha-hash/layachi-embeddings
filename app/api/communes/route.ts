// Communes API — returns commune names filtered by wilaya code
import { NextRequest, NextResponse } from "next/server";
import { getCommunes } from "@/app/wilayas";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wilayaId = searchParams.get("wilayaId") || searchParams.get("wilaya_id") || searchParams.get("code");

  if (!wilayaId) {
    return NextResponse.json({ error: "wilayaId query param required" }, { status: 400 });
  }

  const communeNames = getCommunes(wilayaId);
  return NextResponse.json(communeNames);
}

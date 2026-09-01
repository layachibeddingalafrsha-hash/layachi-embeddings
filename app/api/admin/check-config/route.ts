// Diagnostic endpoint — checks env vars and MongoDB connectivity
// GET /api/admin/check-config
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, any> = {};

  // 1. Check required env vars
  checks.env = {
    MONGODB_URI: process.env.MONGODB_URI ? "✅ set" : "❌ MISSING",
    MONGODB_DB: process.env.MONGODB_DB ? "✅ set" : "❌ MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ set" : "❌ MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "❌ MISSING",
  };

  // 2. Try to connect MongoDB
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    checks.mongodb = "❌ MONGODB_URI not set";
  } else {
    try {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        tls: true,
      });
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      checks.mongodb = "✅ Connected successfully";
    } catch (err: any) {
      checks.mongodb = `❌ ${err.message}`;
    }
  }

  return NextResponse.json(checks, { status: 200 });
}

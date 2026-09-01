// Bulk admin seed script - Run with: node scripts/seed-admins-bulk.js
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const ADMINS = [
  { email: "zakaria@shop.com",  password: "zakichikour1999", full_name: "Zakaria" },
  { email: "basset@shop.com",   password: "hayam5435",       full_name: "Basset"  },
  { email: "yasser@shop.com",   password: "sousou4321",      full_name: "Yasser"  },
  { email: "comondo@shop.com",  password: "abdouabdou1999",  full_name: "Comondo" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error("Missing MONGODB_URI or MONGODB_DB in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  for (const admin of ADMINS) {
    const hashedPassword = await bcrypt.hash(admin.password, 12);

    const result = await db.collection("admins").updateOne(
      { email: admin.email },
      {
        $set: {
          full_name: admin.full_name,
          email: admin.email,
          password: hashedPassword,
          role: "admin",
          active: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const action = result.upsertedCount ? "created" : "updated";
    console.log(`✅ Admin ${action}: ${admin.email}`);
  }

  console.log("\n🔐 Admin credentials:");
  for (const a of ADMINS) {
    console.log(`   ${a.email}  →  ${a.password}`);
  }

  await client.close();
  console.log("\nDone.");
}

main().catch(console.error);

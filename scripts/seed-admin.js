// Admin seed script - Run with: node scripts/seed-admin.js
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

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

  const email = "admin@crocco.dz";
  const password = "admin123456"; // Change this in production!
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.collection("admins").updateOne(
    { email },
    {
      $set: {
        full_name: "Admin",
        email,
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

  console.log(
    result.upsertedCount
      ? "✅ Admin created successfully"
      : "✅ Admin updated successfully"
  );
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change the password in production!");

  await client.close();
}

main().catch(console.error);

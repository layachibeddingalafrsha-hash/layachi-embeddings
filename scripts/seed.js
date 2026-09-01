// Idempotent MongoDB seeder script
const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Parse command line args
const args = process.argv.slice(2);
const dbNameArg = args.find((arg) => arg.startsWith("--db="));
const dbName = dbNameArg
  ? dbNameArg.split("=")[1]
  : process.env.MONGODB_DB || "crocco-dz-admin";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI environment variable is required");
  process.exit(1);
}

// Convert string IDs to ObjectId
function convertIds(data) {
  if (Array.isArray(data)) {
    return data.map((item) => convertIds(item));
  }
  if (data && typeof data === "object") {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "_id" && typeof value === "string" && value.length === 24) {
        converted[key] = new ObjectId(value);
      } else if (key === "categoryId" && typeof value === "string" && value.length === 24) {
        converted[key] = new ObjectId(value);
      } else if (typeof value === "object") {
        converted[key] = convertIds(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }
  return data;
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB: ${dbName}`);

    const db = client.db(dbName);

    // Seed categories
    const categoriesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/categories.json"), "utf-8")
    );
    const categoriesConverted = convertIds(categoriesData);
    
    for (const category of categoriesConverted) {
      await db.collection("categories").updateOne(
        { _id: category._id },
        { $set: category },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${categoriesConverted.length} categories`);

    // Seed products
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/products.json"), "utf-8")
    );
    const productsConverted = convertIds(productsData);
    
    for (const product of productsConverted) {
      await db.collection("products").updateOne(
        { _id: product._id },
        { $set: product },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${productsConverted.length} products`);

    // Seed wilayas
    const wilayasData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/wilayas.json"), "utf-8")
    );
    
    for (const wilaya of wilayasData) {
      await db.collection("wilayas").updateOne(
        { code: wilaya.code },
        { $set: wilaya },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${wilayasData.length} wilayas`);

    // Seed shipping rates
    const shippingData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/shippingRates.json"), "utf-8")
    );
    
    for (const rate of shippingData) {
      await db.collection("shippingRates").updateOne(
        { wilayaCode: rate.wilayaCode },
        { $set: rate },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${shippingData.length} shipping rates`);

    // Seed social links
    const socialData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/social_links.json"), "utf-8")
    );
    
    for (const link of socialData) {
      await db.collection("social_links").updateOne(
        { platform: link.platform },
        { $set: link },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${socialData.length} social links`);

    // Create indexes
    await db.collection("products").createIndex({ slug: 1 }, { unique: true });
    await db.collection("products").createIndex({ categoryId: 1 });
    await db.collection("products").createIndex({ topSelling: -1, salesCount: -1 });
    await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
    await db.collection("categories").createIndex({ order: 1 });
    await db.collection("orders").createIndex({ createdAt: -1 });
    console.log("✅ Created indexes");

    console.log("\n🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();

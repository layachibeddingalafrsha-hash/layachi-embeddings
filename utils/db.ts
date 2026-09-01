// MongoDB singleton connection utility
import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const MAX_RETRY_ATTEMPTS = 3;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Return existing connection if available
  if (db && client) {
    try {
      // Verify connection is still alive
      await client.db().admin().ping();
      return { client, db };
    } catch (pingError) {
      console.warn("⚠️ Existing connection failed ping, reconnecting...");
      client = null;
      db = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    throw new Error("Missing MONGODB_URI or MONGODB_DB environment variables");
  }

  // Retry logic for connection — counter is local so it resets every call
  let connectionAttempts = 0;

  while (connectionAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      connectionAttempts++;
      console.log(`🔄 Attempting MongoDB connection (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);
      
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        retryWrites: true,
        retryReads: true,
        family: 4, // Use IPv4
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      
      await client.connect();
      
      // Verify connection
      await client.db().admin().ping();
      
      db = client.db(dbName);

      console.log(`✅ Connected to MongoDB: ${dbName}`);
      
      return { client, db };
    } catch (error: any) {
      console.error(`❌ MongoDB connection attempt ${connectionAttempts} failed:`, error.message);
      
      // Clean up failed connection
      if (client) {
        try { await client.close(); } catch (_) {}
        client = null;
        db = null;
      }
      
      if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
        const errorMessage = `Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts. ` +
          `Error: ${error.message}. ` +
          `Please check: 1) Network connection, 2) MongoDB Atlas IP whitelist, 3) DNS resolution`;
        throw new Error(errorMessage);
      }
      
      // Exponential backoff
      const waitTime = Math.min(1000 * Math.pow(2, connectionAttempts - 1), 5000);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Failed to establish MongoDB connection");
}

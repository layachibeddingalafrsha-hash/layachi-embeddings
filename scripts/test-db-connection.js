/**
 * Test MongoDB Connection
 * Run this script to diagnose MongoDB connection issues
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔍 MongoDB Connection Diagnostic Tool\n');
  
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  
  console.log('📋 Configuration:');
  console.log(`   URI: ${uri ? uri.substring(0, 30) + '...' : 'NOT SET'}`);
  console.log(`   Database: ${dbName || 'NOT SET'}\n`);
  
  if (!uri || !dbName) {
    console.error('❌ Missing MONGODB_URI or MONGODB_DB in .env.local');
    process.exit(1);
  }
  
  let client;
  
  try {
    console.log('🔄 Attempting to connect to MongoDB...\n');
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    
    await client.connect();
    console.log('✅ Connection established!\n');
    
    // Test ping
    console.log('🏓 Testing ping...');
    await client.db().admin().ping();
    console.log('✅ Ping successful!\n');
    
    // Get database info
    console.log('📊 Database Information:');
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Test each collection
    console.log('\n📦 Testing collections:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} documents`);
    }
    
    console.log('\n✅ All tests passed! Database connection is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      console.error('\n🔧 Troubleshooting DNS/Timeout issues:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)');
      console.error('   3. Check firewall settings (allow outbound connections to MongoDB)');
      console.error('   4. Try using standard connection string instead of SRV');
      console.error('   5. Check if your DNS server can resolve MongoDB Atlas domains');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed.');
    }
  }
}

testConnection();

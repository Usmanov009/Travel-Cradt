const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI topilmadi'); process.exit(1); }
  console.log('Ulanmoqda:', uri.replace(/:[^:@/]+@/, ':****@'));
  await mongoose.connect(uri, { dbName: 'travelcraft', serverSelectionTimeoutMS: 15000 });
  console.log('✅ MongoDB Atlas ga ulandi!');
  const db = mongoose.connection.db;
  const ping = await db.admin().ping();
  console.log('Ping:', JSON.stringify(ping));
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  - ${c.name}: ${count} ta hujjat`);
  }
  if (collections.length === 0) console.log('  (travelcraft bazasi bo‘sh — kolleksiyalar yo‘q)');
  await mongoose.disconnect();
}

main().catch(err => { console.error('❌ Xato:', err.message); process.exit(1); });
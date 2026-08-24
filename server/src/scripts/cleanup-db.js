const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI topilmadi'); process.exit(1); }
  await mongoose.connect(uri, { dbName: 'travelcraft', serverSelectionTimeoutMS: 15000 });
  console.log('✅ Atlas ga ulandi');
  const db = mongoose.connection.db;

  // Saqlanadigan kolleksiyalar: tourcompanies (tur firmalar) + users (faqat admin qoladi)
  const collections = await db.listCollections().toArray();

  for (const c of collections) {
    if (c.name === 'tourcompanies') {
      console.log(`⏭️  ${c.name}: saqlandi (tur firmalar)`);
      continue;
    }
    if (c.name === 'users') {
      const res = await db.collection('users').deleteMany({
        $or: [
          { email: { $ne: 'admin@gmail.com' } },
          { role: { $ne: 'super_admin' } },
        ],
      });
      console.log(`🗑️  users: ${res.deletedCount} ta o'chirildi (admin qoldi)`);
      continue;
    }
    const res = await db.collection(c.name).deleteMany({});
    console.log(`🗑️  ${c.name}: ${res.deletedCount} ta o'chirildi`);
  }

  // Tekshirish
  console.log('\n--- Qolgan ma\'lumotlar ---');
  for (const c of await db.listCollections().toArray()) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  - ${c.name}: ${count} ta hujjat`);
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error('❌ Xato:', err.message); process.exit(1); });
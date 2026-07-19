const { Pool } = require('pg');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, TourCompany, Package, Booking, TravelOffer, TelegramUser, getNextSequence } = require('./models');

const PG_URL = process.env.DATABASE_URL;
const MONGO_URL = process.env.MONGODB_URI;

async function main() {
  if (!PG_URL) {
    console.error('DATABASE_URL topilmadi — .env faylida PostgreSQL ulanish satrini kiriting');
    process.exit(1);
  }
  if (!MONGO_URL) {
    console.error('MONGODB_URI topilmadi — .env faylida MongoDB Atlas ulanish satrini kiriting');
    process.exit(1);
  }

  const pgPool = new Pool({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await mongoose.connect(MONGO_URL, { dbName: 'travelcraft' });

  console.log('PostgreSQL va MongoDB ulandi...');

  const pgClient = await pgPool.connect();

  try {
    await migrateUsers(pgClient);
    await migrateTourCompanies(pgClient);
    await migratePackages(pgClient);
    await migrateTelegramUsers(pgClient);
    await migrateBookings(pgClient);
    await migrateTravelOffers(pgClient);

    console.log('Migratsiya tugadi!');
  } catch (err) {
    console.error('Migratsiya xatosi:', err);
  } finally {
    pgClient.release();
    await pgPool.end();
    await mongoose.disconnect();
  }
}

async function migrateUsers(pgClient) {
  console.log('Migratsiya: users...');
  const { rows } = await pgClient.query('SELECT * FROM users');
  for (const row of rows) {
    const existing = await User.findOne({ email: row.email.toLowerCase() });
    if (existing) continue;
    const user = new User({
      name: row.name,
      email: row.email.toLowerCase(),
      password_hash: row.password_hash,
      role: row.role,
      blocked: row.blocked,
      company_id: row.company_id || null,
      telegram_id: row.telegram_id || null,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await user.save();
  }
  console.log(`users: ${rows.length} ta yozuv ko‘chirildi`);
}

async function migrateTourCompanies(pgClient) {
  console.log('Migratsiya: tour_companies...');
  const { rows } = await pgClient.query('SELECT * FROM tour_companies');
  for (const row of rows) {
    const existing = await TourCompany.findOne({ email: row.email.toLowerCase() });
    if (existing) continue;
    const company = new TourCompany({
      name: row.name,
      email: row.email.toLowerCase(),
      password_hash: row.password_hash,
      phone: row.phone || null,
      address: row.address || null,
      website: row.website || null,
      description: row.description || null,
      status: row.status || 'pending',
      logo: row.logo || null,
      founded_year: row.founded_year || null,
      certificates: row.certificates || [],
      achievements: row.achievements || [],
      countries: row.countries || [],
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await company.save();
  }
  console.log(`tour_companies: ${rows.length} ta yozuv ko‘chirildi`);
}

async function migratePackages(pgClient) {
  console.log('Migratsiya: packages...');
  const { rows } = await pgClient.query('SELECT * FROM packages');
  for (const row of rows) {
    const existing = await Package.findOne({ $or: [{ id: row.id }, { local_id: row.local_id }] });
    if (existing && existing.id === row.id) continue;
    const pkg = new Package({
      id: row.id,
      local_id: row.local_id || null,
      type: row.type || 'custom',
      category: row.category || null,
      title: row.title,
      description: row.description || null,
      image: row.image || null,
      duration: row.duration || null,
      price: row.price || 0,
      price_currency: row.price_currency || 'USD',
      rating: row.rating || 0,
      included: row.included || [],
      country: row.country || null,
      hotel: row.hotel || null,
      flight_included: row.flight_included || false,
      vibe: row.vibe || null,
      video: row.video || null,
      interests: row.interests || [],
      partners: row.partners || [],
      translations: row.translations || {},
      company_id: row.company_id || null,
      pdf: row.pdf || null,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await pkg.save();
  }
  console.log(`packages: ${rows.length} ta yozuv ko‘chirildi`);
}

async function migrateTelegramUsers(pgClient) {
  console.log('Migratsiya: telegram_users...');
  const { rows } = await pgClient.query('SELECT * FROM telegram_users');
  for (const row of rows) {
    const existing = await TelegramUser.findOne({ telegram_id: row.telegram_id });
    if (existing) continue;
    const tgUser = new TelegramUser({
      telegram_id: row.telegram_id,
      name: row.name || null,
      phone: row.phone || null,
      username: row.username || null,
      first_name: row.first_name || null,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await tgUser.save();
  }
  console.log(`telegram_users: ${rows.length} ta yozuv ko‘chirildi`);
}

async function migrateBookings(pgClient) {
  console.log('Migratsiya: bookings...');
  const { rows } = await pgClient.query('SELECT * FROM bookings');
  for (const row of rows) {
    const existing = await Booking.findOne({ id: row.id });
    if (existing) continue;
    const booking = new Booking({
      id: row.id,
      title: row.title || null,
      type: row.type || null,
      price: row.price || 0,
      price_currency: row.price_currency || 'USD',
      name: row.name || null,
      phone: row.phone || null,
      guests: row.guests || 1,
      days: row.days || 1,
      status: row.status || 'pending',
      booked_at: row.booked_at ? new Date(row.booked_at) : undefined,
      telegram_id: row.telegram_id || null,
      travel_date: row.travel_date ? new Date(row.travel_date) : null,
      company_id: row.company_id || null,
      package_id: row.package_id || null,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await booking.save();
  }
  console.log(`bookings: ${rows.length} ta yozuv ko‘chirildi`);
}

async function migrateTravelOffers(pgClient) {
  console.log('Migratsiya: travel_offers...');
  const { rows } = await pgClient.query('SELECT * FROM travel_offers');
  for (const row of rows) {
    const existing = await TravelOffer.findOne({ id: row.id });
    if (existing) continue;
    const offer = new TravelOffer({
      id: row.id,
      type: row.type || 'flight',
      title: row.title,
      image: row.image || null,
      description: row.description || null,
      phone: row.phone || null,
      location: row.location || null,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
    });
    await offer.save();
  }
  console.log(`travel_offers: ${rows.length} ta yozuv ko‘chirildi`);
}

main().catch(err => {
  console.error('Xatolik:', err);
  process.exit(1);
});

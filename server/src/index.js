const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const pool = require('./db');
let createBot = () => null;
let getTelegramUser = async () => null;
try { ({ createBot, getTelegramUser } = require('./bot')); } catch (e) { console.warn('Bot yuklanmadi:', e.message); }

const { getPackages, createPackage, getPackageById } = require('./controllers/packagesController');
const { getBookings, createBooking, updateBooking, deleteBooking } = require('./controllers/bookingsController');
const { enrichCountry } = require('./controllers/enrichController');
const { getAiRecommendation, chatWithAi, getDestinationInfo } = require('./controllers/aiController');
const { geocodePlace } = require('./controllers/placesController');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ ok: true, db: true });
  } catch (err) {
    return res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

// Telegram foydalanuvchi ma'lumotlarini qaytarish
app.get('/api/tg-user/:telegram_id', async (req, res) => {
  try {
    const user = await getTelegramUser(req.params.telegram_id);
    if (!user) return res.json({});
    return res.json({ name: user.name, phone: user.phone });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.use('/api/auth', require('./routes/auth'));
app.get('/api/enrich', enrichCountry);
app.get('/api/places/geocode', geocodePlace);
app.post('/api/ai/recommend', getAiRecommendation);
app.post('/api/ai/chat', chatWithAi);
app.post('/api/ai/destination-info', getDestinationInfo);

app.get('/api/packages', getPackages);
app.get('/api/packages/:id', getPackageById);
app.post('/api/packages', createPackage);

app.get('/api/companies', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, phone, address, website, description, logo,
              founded_year, certificates, achievements, countries
       FROM tour_companies WHERE status = 'approved' ORDER BY name`
    );
    return res.json({ companies: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, phone, address, website, description, logo,
              founded_year, certificates, achievements, countries
       FROM tour_companies WHERE id = $1 AND status = 'approved'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Company not found' });

    const { rows: packages } = await pool.query(
      `SELECT id, type, title, image, price, price_currency FROM packages WHERE company_id = $1 ORDER BY created_at DESC LIMIT 12`,
      [req.params.id]
    );
    return res.json({ ...rows[0], packages });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/travel-offers', async (req, res) => {
  try {
    const { type } = req.query;
    const params = [];
    let query = 'SELECT * FROM travel_offers';
    if (type === 'flight' || type === 'hotel') {
      params.push(type);
      query += ' WHERE type = $1';
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return res.json({ offers: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', getBookings);
app.post('/api/bookings', createBooking);
app.put('/api/bookings/:id', updateBooking);
app.delete('/api/bookings/:id', deleteBooking);

// Admin routes loaded in try-catch so a missing package never blocks port binding
try {
  app.use('/api/admin/auth', require('./routes/admin/auth'));
  app.use('/api/admin', require('./routes/admin/dashboard'));
  app.use('/api/admin/users', require('./routes/admin/users'));
  app.use('/api/admin/packages', require('./routes/admin/packages'));
  app.use('/api/admin/companies', require('./routes/admin/companies'));
  app.use('/api/admin/bookings', require('./routes/admin/bookings'));
  app.use('/api/admin/revenue', require('./routes/admin/revenue'));
  app.use('/api/admin/admin-accounts', require('./routes/admin/adminAccounts'));
  app.use('/api/admin/travel-offers', require('./routes/admin/travelOffers'));
  console.log('Admin routes loaded.');
} catch (err) {
  console.error('Admin routes failed to load:', err.message);
}

const PORT = process.env.PORT || 8080;

function keepAlive(url) {
  const client = url.startsWith('https') ? https : http;
  client.get(url, (res) => {
    console.log(`[keep-alive] ping ${url} → ${res.statusCode}`);
  }).on('error', (err) => {
    console.warn(`[keep-alive] ping failed: ${err.message}`);
  });
}

async function setupDatabase() {
  const bcrypt = require('bcryptjs'); // lazy — only runs after port is open
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        local_id INTEGER,
        type VARCHAR(50) NOT NULL DEFAULT 'custom',
        category VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT,
        duration VARCHAR(100),
        price NUMERIC(10,2) DEFAULT 0,
        price_currency VARCHAR(10) DEFAULT 'USD',
        rating NUMERIC(3,1) DEFAULT 0,
        included TEXT[],
        country VARCHAR(100),
        hotel VARCHAR(255),
        flight_included BOOLEAN DEFAULT FALSE,
        vibe TEXT,
        video TEXT,
        interests TEXT[],
        partners TEXT[],
        translations JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        type VARCHAR(50),
        price NUMERIC(10,2),
        name VARCHAR(255),
        phone VARCHAR(50),
        guests INTEGER DEFAULT 1,
        days INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending',
        booked_at TIMESTAMPTZ DEFAULT NOW(),
        package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS telegram_users (
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        username VARCHAR(100),
        first_name VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tour_companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        website TEXT,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        logo TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS travel_offers (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL DEFAULT 'flight',
        title VARCHAR(255) NOT NULL,
        image TEXT,
        description TEXT,
        phone VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // company_id ustunini packages jadvaliga qo'shish
    await client.query(`
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES tour_companies(id) ON DELETE SET NULL;
    `).catch(() => {});

    // company_id ustunini users jadvaliga qo'shish (tur firma adminlari uchun)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES tour_companies(id) ON DELETE SET NULL;
    `).catch(() => {});

    // telegram_id ustunini users jadvaliga qo'shish (bot orqali avtomatik kirish uchun)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) UNIQUE;
    `).catch(() => {});

    // telegram_id va travel_date ustunlarini bookings jadvaliga qo'shish
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50);
    `).catch(() => {});
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_date DATE;
    `).catch(() => {});

    // company_id ustunini bookings jadvaliga qo'shish (qaysi firmaga tegishli ekanini bilish uchun)
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES tour_companies(id) ON DELETE SET NULL;
    `).catch(() => {});

    // Tur firma haqida qo'shimcha ma'lumotlar (necha yildan beri, sertifikatlar, yutuqlar, davlatlar)
    await client.query(`
      ALTER TABLE tour_companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
    `).catch(() => {});
    await client.query(`
      ALTER TABLE tour_companies ADD COLUMN IF NOT EXISTS certificates TEXT[];
    `).catch(() => {});
    await client.query(`
      ALTER TABLE tour_companies ADD COLUMN IF NOT EXISTS achievements TEXT[];
    `).catch(() => {});
    await client.query(`
      ALTER TABLE tour_companies ADD COLUMN IF NOT EXISTS countries TEXT[];
    `).catch(() => {});

    // price_currency ustunini packages jadvaliga qo'shish
    await client.query(`
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'USD';
    `).catch(() => {});

    // package_id ustunini bookings jadvaliga qo'shish
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL;
    `).catch(() => {});

    // price_currency ustunini bookings jadvaliga qo'shish (narxni to'g'ri ko'rsatish uchun)
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'USD';
    `).catch(() => {});

    // Mavjud bronlarning company_id sini to'ldirish (packages.title orqali moslashtirish)
    await client.query(`
      UPDATE bookings b
      SET company_id = p.company_id
      FROM packages p
      WHERE b.title = p.title
        AND p.company_id IS NOT NULL
        AND b.company_id IS NULL;
    `).catch(() => {});

    console.log('Database tables ready.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@1shu';
    const { rows } = await client.query('SELECT id, role FROM users WHERE email = $1', [adminEmail]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'super_admin')`,
        ['Super Admin', adminEmail, hash]
      );
      console.log('Super admin created:', adminEmail);
    } else if (rows[0].role === 'admin') {
      // Eskidan 'admin' bo'lib yaratilgan bo'lsa, 'super_admin' ga yangilaymiz
      await client.query(`UPDATE users SET role = 'super_admin', name = 'Super Admin' WHERE email = $1`, [adminEmail]);
      console.log('Upgraded to super_admin:', adminEmail);
    }
  } finally {
    client.release();
  }
}

// Serve built frontend in production
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Port ALWAYS opens first — DB setup runs in background after
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);

  const selfUrl = process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
    : `http://localhost:${PORT}/api/health`;

  setInterval(() => keepAlive(selfUrl), 4 * 60 * 1000);

  setupDatabase()
    .then(() => console.log('NeonDB connected and ready'))
    .catch(err => console.error('DB setup error:', err.message));

  const bot = createBot();
  if (bot) {
    console.log('🤖 Telegram bot ishga tushmoqda...');
    bot.launch()
      .catch(err => console.error('Bot xatosi:', err.message));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
});

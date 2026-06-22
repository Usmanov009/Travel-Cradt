try { require('dotenv').config({ path: require('path').join(__dirname, '../../.env') }); } catch (_) {}
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const path = require('path');
const pool = require('./db');
let createBot = () => null;
try { ({ createBot } = require('./bot')); } catch (e) { console.warn('Bot yuklanmadi:', e.message); }

const { getPackages, createPackage } = require('./controllers/packagesController');
const { getBookings, createBooking, updateBooking } = require('./controllers/bookingsController');
const { enrichCountry } = require('./controllers/enrichController');
const { getAiRecommendation, chatWithAi, getDestinationInfo, getItinerary } = require('./controllers/aiController');
const { geocodePlace } = require('./controllers/placesController');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.get('/api/enrich', enrichCountry);
app.get('/api/places/geocode', geocodePlace);
app.post('/api/ai/recommend', getAiRecommendation);
app.post('/api/ai/chat', chatWithAi);
app.post('/api/ai/destination-info', getDestinationInfo);
app.post('/api/ai/itinerary', getItinerary);

app.get('/api/packages', getPackages);
app.post('/api/packages', createPackage);

app.get('/api/bookings', getBookings);
app.post('/api/bookings', createBooking);
app.put('/api/bookings/:id', updateBooking);

// Admin routes loaded in try-catch so a missing package never blocks port binding
try {
  const adminAuthRoutes = require('./routes/admin/auth');
  const adminDashboardRoutes = require('./routes/admin/dashboard');
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/admin', adminDashboardRoutes);
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
        booked_at TIMESTAMPTZ DEFAULT NOW()
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
    `);
    console.log('Database tables ready.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@1shu';
    const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
        ['Admin', adminEmail, hash]
      );
      console.log('Admin user created:', adminEmail);
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

  setInterval(() => keepAlive(selfUrl), 10_000);

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

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { connectDB } = require('./db');
const { connectMongo, mongoose } = require('./mongodb');
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
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    const mongoConnected = mongoose.connection.readyState === 1;
    return res.json({ ok: true, db: true, mongo: mongoConnected });
  } catch (err) {
    return res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

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
    const companies = await mongoose.connection.db.collection('tourcompanies').find().toArray();
    return res.json({ companies });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await mongoose.connection.db.collection('tourcompanies').findOne({ id: parseInt(req.params.id) });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const packages = await mongoose.connection.db.collection('packages').find({ company_id: company.id }).limit(12).toArray();
    return res.json({ ...company, packages });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/travel-offers', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type === 'flight' || type === 'hotel' ? { type } : {};
    const offers = await mongoose.connection.db.collection('traveloffers').find(filter).sort({ created_at: -1 }).toArray();
    return res.json({ offers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', getBookings);
app.post('/api/bookings', createBooking);
app.put('/api/bookings/:id', updateBooking);
app.delete('/api/bookings/:id', deleteBooking);

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

const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);

  const selfUrl = process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
    : `http://localhost:${PORT}/api/health`;

  setInterval(() => keepAlive(selfUrl), 4 * 60 * 1000);

  try {
    await connectDB();
    console.log('MongoDB connected and ready');
  } catch (err) {
    console.error('DB setup error:', err.message);
  }

  try {
    await connectMongo();
  } catch (err) {
    console.error('MongoDB setup error:', err.message);
  }

  try {
    const bcrypt = require('bcryptjs');
    const { User } = require('./models');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@1shu';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: 'Super Admin', email: adminEmail, password_hash: hash, role: 'super_admin' });
      console.log('Super admin created:', adminEmail);
    } else if (existing.role === 'admin') {
      await User.updateOne({ email: adminEmail }, { role: 'super_admin', name: 'Super Admin' });
      console.log('Upgraded to super_admin:', adminEmail);
    }
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }

  const bot = createBot();
  if (bot) {
    console.log('Telegram bot ishga tushmoqda...');
    bot.launch()
      .catch(err => console.error('Bot xatosi:', err.message));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
});

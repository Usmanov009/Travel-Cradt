const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const { normalizePhone } = require('../utils/phone');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Telegram Web App initData imzosini tekshiradi va ichidagi foydalanuvchi ma'lumotini qaytaradi
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const pairs = [];
  for (const [key, value] of params.entries()) pairs.push(`${key}=${value}`);
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (computedHash !== hash) return null;

  const authDate = parseInt(params.get('auth_date') || '0', 10);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!phone || !password || !name) return res.status(400).json({ error: "Ism, telefon va parol kerak" });
  if (password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgidan iborat bo'lsin" });

  const normalizedPhone = normalizePhone(phone);
  const client = await pool.connect();
  try {
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [normalizedPhone]);
    if (exists.rows.length > 0) return res.status(409).json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });

    const hash = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, name, email, role`,
      [name.trim(), normalizedPhone, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: "Server xatosi yuz berdi" });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Telefon va parol kerak" });

  const normalizedPhone = normalizePhone(phone);
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [normalizedPhone]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Telefon raqam yoki parol noto'g'ri" });
    if (user.blocked) return res.status(403).json({ error: "Hisobingiz bloklangan" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Telefon raqam yoki parol noto'g'ri" });

    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: "Server xatosi yuz berdi" });
  } finally {
    client.release();
  }
});

// Bot orqali "🌐 Web Ilovani ochish" tugmasi bosilganda ishlaydi:
// foydalanuvchi botda avval telefon/ismini bergan bo'lsa, forma to'ldirmasdan avtomatik kiritadi.
router.post('/telegram', async (req, res) => {
  const { initData } = req.body;
  if (!initData) return res.status(400).json({ error: 'initData kerak' });

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return res.status(503).json({ error: 'Telegram xizmati sozlanmagan' });

  const tgUser = verifyTelegramInitData(initData, botToken);
  if (!tgUser || !tgUser.id) return res.status(401).json({ error: "Telegram ma'lumotlari tasdiqlanmadi" });

  const telegramId = String(tgUser.id);
  const client = await pool.connect();
  try {
    let user = (await client.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId])).rows[0];

    if (!user) {
      const profile = (await client.query(
        'SELECT * FROM telegram_users WHERE telegram_id = $1',
        [telegramId]
      )).rows[0];

      if (!profile || !profile.phone) {
        return res.status(404).json({ error: 'not_registered' });
      }

      const normalizedPhone = normalizePhone(profile.phone);
      const byPhone = (await client.query('SELECT * FROM users WHERE email = $1', [normalizedPhone])).rows[0];

      if (byPhone) {
        await client.query('UPDATE users SET telegram_id = $1 WHERE id = $2', [telegramId, byPhone.id]);
        user = { ...byPhone, telegram_id: telegramId };
      } else {
        const randomPass = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(randomPass, 10);
        user = (await client.query(
          `INSERT INTO users (name, email, password_hash, role, telegram_id) VALUES ($1, $2, $3, 'user', $4) RETURNING *`,
          [profile.name || tgUser.first_name || 'Foydalanuvchi', normalizedPhone, hash, telegramId]
        )).rows[0];
      }
    }

    if (user.blocked) return res.status(403).json({ error: 'Hisobingiz bloklangan' });

    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Telegram auth error:', err.message);
    res.status(500).json({ error: 'Server xatosi yuz berdi' });
  } finally {
    client.release();
  }
});

module.exports = router;

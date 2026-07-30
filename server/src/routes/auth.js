const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, TelegramUser } = require('../models');
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
  try {
    const exists = await User.findOne({ email: normalizedPhone });
    if (exists) return res.status(409).json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name: name.trim(), email: normalizedPhone, password_hash: hash, role: 'user' });
    await user.save();
    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: "Server xatosi yuz berdi" });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Telefon va parol kerak" });

  const normalizedPhone = normalizePhone(phone);
  try {
    const user = await User.findOne({ email: normalizedPhone });
    if (!user) return res.status(401).json({ error: "Telefon raqam yoki parol noto'g'ri" });
    if (user.blocked) return res.status(403).json({ error: "Hisobingiz bloklangan" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Telefon raqam yoki parol noto'g'ri" });

    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: "Server xatosi yuz berdi" });
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
  try {
    let user = await User.findOne({ telegram_id: telegramId });

    if (!user) {
      const profile = await TelegramUser.findOne({ telegram_id: telegramId });

      if (!profile || !profile.phone) {
        return res.status(404).json({ error: 'not_registered' });
      }

      const normalizedPhone = normalizePhone(profile.phone);
      const byPhone = await User.findOne({ email: normalizedPhone });

      if (byPhone) {
        byPhone.telegram_id = telegramId;
        await byPhone.save();
        user = byPhone;
      } else {
        const randomPass = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(randomPass, 10);
        user = new User({
          name: profile.name || tgUser.first_name || 'Foydalanuvchi',
          email: normalizedPhone,
          password_hash: hash,
          role: 'user',
          telegram_id: telegramId,
        });
        await user.save();
      }
    }

    if (user.blocked) return res.status(403).json({ error: 'Hisobingiz bloklangan' });

    const token = jwt.sign({ id: user.id, phone: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.email, role: user.role } });
  } catch (err) {
    console.error('Telegram auth error:', err.message);
    res.status(500).json({ error: 'Server xatosi yuz berdi' });
  }
});

module.exports = router;

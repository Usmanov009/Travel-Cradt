const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function normalizePhone(phone) {
  return phone.replace(/\s+/g, '').trim();
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

module.exports = router;

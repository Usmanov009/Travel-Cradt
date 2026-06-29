const pool = require('../db');

async function getPackages(req, res) {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM packages ORDER BY created_at DESC LIMIT 200';
    const params = [];
    if (type) {
      query = 'SELECT * FROM packages WHERE type = $1 ORDER BY created_at DESC LIMIT 200';
      params.push(type);
    }
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getPackageById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM packages WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Package not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createPackage(req, res) {
  try {
    const { type, category, title, description, image, duration, price, rating,
            included, country, hotel, flight_included, vibe, video, interests, partners, translations } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO packages
        (type, category, title, description, image, duration, price, rating,
         included, country, hotel, flight_included, vibe, video, interests, partners, translations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [type, category, title, description, image, duration, price || 0, rating || 0,
       included || [], country, hotel, flight_included || false, vibe, video,
       interests || null, partners || null, JSON.stringify(translations || {})]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { getPackages, createPackage, getPackageById };

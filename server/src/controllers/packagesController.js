const pool = require('../db');

async function getPackages(req, res) {
  try {
    const { type } = req.query;
    let query = `SELECT p.*, tc.name AS company_name, tc.logo AS company_logo
                 FROM packages p LEFT JOIN tour_companies tc ON p.company_id = tc.id
                 ORDER BY p.created_at DESC LIMIT 200`;
    const params = [];
    if (type) {
      query = `SELECT p.*, tc.name AS company_name, tc.logo AS company_logo
               FROM packages p LEFT JOIN tour_companies tc ON p.company_id = tc.id
               WHERE p.type = $1 ORDER BY p.created_at DESC LIMIT 200`;
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
<<<<<<< HEAD
=======
    // Paketni id yoki local_id orqali topamiz (bot ba'zan local_id yuboradi)
>>>>>>> 24a26569d198a1ee71ae2a381175503046b09243
    const params = [req.params.id];
    let typeFilter = '';
    if (req.query.type) {
      typeFilter = ' AND p.type = $2';
      params.push(req.query.type);
    }
    const { rows } = await pool.query(
      `SELECT p.*, tc.name AS company_name, tc.logo AS company_logo
       FROM packages p LEFT JOIN tour_companies tc ON p.company_id = tc.id
       WHERE (p.id = $1 OR p.local_id = $1)${typeFilter}
       ORDER BY (p.id = $1)::int DESC
       LIMIT 1`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Package not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createPackage(req, res) {
  try {
    const { type, category, title, description, image, duration, price, rating,
            included, country, hotel, flight_included, vibe, video, interests, partners, translations, price_currency } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO packages
        (type, category, title, description, image, duration, price, rating,
         included, country, hotel, flight_included, vibe, video, interests, partners, translations, price_currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [type, category, title, description, image, duration, price || 0, rating || 0,
       included || [], country, hotel, flight_included || false, vibe, video,
       interests || null, partners || null, JSON.stringify(translations || {}), price_currency || 'USD']
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { getPackages, createPackage, getPackageById };

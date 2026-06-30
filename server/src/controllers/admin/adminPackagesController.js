const pool = require('../../db');

async function getPackages(req, res) {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin' && req.user.company_id) {
      query = `
        SELECT p.*, tc.name AS company_name
        FROM packages p
        LEFT JOIN tour_companies tc ON p.company_id = tc.id
        WHERE p.company_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.company_id];
    } else {
      query = `
        SELECT p.*, tc.name AS company_name
        FROM packages p
        LEFT JOIN tour_companies tc ON p.company_id = tc.id
        ORDER BY p.created_at DESC
      `;
    }

    const { rows } = await pool.query(query, params);
    return res.json({ packages: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createPackage(req, res) {
  try {
    const {
      type, category, title, description, image, duration,
      price, rating, included, country, hotel, flight_included,
      vibe, interests, partners, translations, company_id
    } = req.body;

    // Tur firma admini faqat o'z kompaniyasi nomidan paket yarata oladi
    const effectiveCompanyId = req.user.role === 'admin'
      ? (req.user.company_id || null)
      : (company_id || null);

    const { rows } = await pool.query(`
      INSERT INTO packages (type, category, title, description, image, duration, price, rating,
        included, country, hotel, flight_included, vibe, interests, partners, translations, company_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `, [type || 'domestic', category, title, description, image, duration,
      price || 0, rating || 0, included || [], country, hotel, flight_included || false,
      vibe, interests || [], partners || [], translations || {}, effectiveCompanyId]);

    return res.json({ package: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updatePackage(req, res) {
  try {
    const { id } = req.params;

    // Tur firma admini faqat o'z paketlarini tahrirlashi mumkin
    if (req.user.role === 'admin' && req.user.company_id) {
      const check = await pool.query('SELECT company_id FROM packages WHERE id = $1', [id]);
      if (!check.rows.length) return res.status(404).json({ error: 'Package not found' });
      if (check.rows[0].company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Bu paket sizga tegishli emas' });
      }
    }

    const {
      type, category, title, description, image, duration,
      price, rating, included, country, hotel, flight_included,
      vibe, interests, partners, translations
    } = req.body;

    const { rows } = await pool.query(`
      UPDATE packages SET
        type=$1, category=$2, title=$3, description=$4, image=$5, duration=$6,
        price=$7, rating=$8, included=$9, country=$10, hotel=$11, flight_included=$12,
        vibe=$13, interests=$14, partners=$15, translations=$16
      WHERE id=$17
      RETURNING *
    `, [type, category, title, description, image, duration,
      price, rating, included || [], country, hotel, flight_included || false,
      vibe, interests || [], partners || [], translations || {}, id]);

    if (!rows.length) return res.status(404).json({ error: 'Package not found' });
    return res.json({ package: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deletePackage(req, res) {
  try {
    const { id } = req.params;

    // Tur firma admini faqat o'z paketlarini o'chira oladi
    if (req.user.role === 'admin' && req.user.company_id) {
      const check = await pool.query('SELECT company_id FROM packages WHERE id = $1', [id]);
      if (!check.rows.length) return res.status(404).json({ error: 'Package not found' });
      if (check.rows[0].company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Bu paket sizga tegishli emas' });
      }
    }

    const { rows } = await pool.query('DELETE FROM packages WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Package not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getPackages, createPackage, updatePackage, deletePackage };

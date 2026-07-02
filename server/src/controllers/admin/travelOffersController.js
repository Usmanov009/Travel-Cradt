const pool = require('../../db');

async function getTravelOffers(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM travel_offers ORDER BY created_at DESC');
    return res.json({ offers: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { type, title, image, description, phone, location } = req.body;
    if (!title) return res.status(400).json({ error: 'Nomi kerak' });

    const { rows } = await pool.query(
      `INSERT INTO travel_offers (type, title, image, description, phone, location)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [type === 'hotel' ? 'hotel' : 'flight', title, image, description, phone, location]
    );
    return res.json({ offer: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { id } = req.params;
    const { type, title, image, description, phone, location } = req.body;

    const { rows } = await pool.query(
      `UPDATE travel_offers SET type=$1, title=$2, image=$3, description=$4, phone=$5, location=$6
       WHERE id=$7 RETURNING *`,
      [type === 'hotel' ? 'hotel' : 'flight', title, image, description, phone, location, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ offer: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM travel_offers WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getTravelOffers, createTravelOffer, updateTravelOffer, deleteTravelOffer };

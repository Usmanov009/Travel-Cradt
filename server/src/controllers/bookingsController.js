const pool = require('../db');

async function getBookings(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookings ORDER BY booked_at DESC LIMIT 500'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createBooking(req, res) {
  try {
    const { title, type, price, name, phone, guests, days, status, telegram_id, travel_date } = req.body;
    console.log('[createBooking]', { title, name, phone, guests, days, status, telegram_id: telegram_id ? '✓' : null });

    let resolvedTelegramId = telegram_id || null;
    try {
      if (!resolvedTelegramId && phone) {
        const cleanPhone = String(phone).replace(/\s/g, '');
        const tgUser = await pool.query(
          `SELECT telegram_id FROM telegram_users WHERE REPLACE(phone, ' ', '') = $1 LIMIT 1`,
          [cleanPhone]
        );
        if (tgUser.rows.length > 0) resolvedTelegramId = tgUser.rows[0].telegram_id;
      }
    } catch {}

    // Paket company_id sini aniqlash
    let companyId = null;
    try {
      if (title) {
        const pkgRow = await pool.query(
          'SELECT company_id FROM packages WHERE title = $1 AND company_id IS NOT NULL LIMIT 1',
          [title]
        );
        if (pkgRow.rows.length > 0) companyId = pkgRow.rows[0].company_id;
      }
    } catch {}

    try {
      const { rows } = await pool.query(
        `INSERT INTO bookings (title, type, price, name, phone, guests, days, status, telegram_id, travel_date, company_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [title, type, price, name, phone, guests || 1, days || 1, status || 'pending', resolvedTelegramId, travel_date || null, companyId]
      );
      console.log('[createBooking] saved id:', rows[0].id, 'company_id:', companyId);
      return res.status(201).json(rows[0]);
    } catch (insertErr) {
      console.warn('[createBooking] full insert failed:', insertErr.message, '— trying fallback');
      const { rows } = await pool.query(
        `INSERT INTO bookings (title, type, price, name, phone, guests, days, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [title, type, price, name, phone, guests || 1, days || 1, status || 'pending']
      );
      console.log('[createBooking] fallback saved id:', rows[0].id);
      return res.status(201).json(rows[0]);
    }
  } catch (err) {
    console.error('[createBooking] error:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function updateBooking(req, res) {
  try {
    const id = req.params.id;
    const { status, name, phone, guests, days } = req.body;
    const { rows } = await pool.query(
      `UPDATE bookings
       SET status = COALESCE($1, status),
           name   = COALESCE($2, name),
           phone  = COALESCE($3, phone),
           guests = COALESCE($4, guests),
           days   = COALESCE($5, days)
       WHERE id = $6
       RETURNING *`,
      [status, name, phone, guests, days, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { getBookings, createBooking, updateBooking };

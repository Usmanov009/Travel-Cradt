const pool = require('../../db');
const https = require('https');

function notifyTelegram(telegramId, text) {
  const token = (process.env.BOT_TOKEN || '').trim();
  if (!token || !telegramId) {
    console.log(`[notify] skipped — token:${!!token} tgId:${telegramId}`);
    return;
  }
  const body = JSON.stringify({ chat_id: String(telegramId), text });
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (!parsed.ok) console.error('[notify] Telegram error:', parsed.description);
      else console.log(`[notify] sent to ${telegramId}`);
    });
  });
  req.on('error', (e) => console.error('[notify] request error:', e.message));
  req.write(body);
  req.end();
}

async function getBookings(req, res) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const params = [];
    let whereClause = '';

    // Tur firma admini faqat o'z kompaniyasiga tegishli bronlarni ko'radi
    if (req.user.role === 'admin' && req.user.company_id) {
      whereClause = `WHERE b.title IN (
        SELECT p.title FROM packages p WHERE p.company_id = $${params.length + 1}
      )`;
      params.push(req.user.company_id);
      if (status) {
        whereClause += ` AND b.status = $${params.length + 1}`;
        params.push(status);
      }
    } else if (status) {
      whereClause = `WHERE status = $${params.length + 1}`;
      params.push(status);
    }

    const query = `SELECT b.* FROM bookings b ${whereClause} ORDER BY b.booked_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const countQuery = `SELECT COUNT(*) FROM bookings b ${whereClause}`;
    const countParams = params.slice(0, params.length - 2);

    const { rows } = await pool.query(query, params);
    const countRes = await pool.query(countQuery, countParams);
    return res.json({ bookings: rows, total: parseInt(countRes.rows[0].count) });
  } catch (err) {
    console.error('[getBookings] error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

async function queryWithRetry(sql, params, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      lastErr = err;
      console.error(`[db] attempt ${i + 1}/${retries + 1} failed: ${err.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    console.log(`[updateBooking] id=${id} status=${status} content-type=${req.headers['content-type']}`);
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await queryWithRetry(
      'UPDATE bookings SET status = $1 WHERE id = $2::integer RETURNING *',
      [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];

    // telegram_id yo'q bo'lsa, telefon orqali topamiz
    let tgId = booking.telegram_id;
    try {
      if (!tgId && booking.phone) {
        const cleanPhone = String(booking.phone).replace(/\s/g, '');
        const tgUser = await pool.query(
          `SELECT telegram_id FROM telegram_users WHERE REPLACE(phone, ' ', '') = $1 LIMIT 1`,
          [cleanPhone]
        );
        if (tgUser.rows.length > 0) {
          tgId = tgUser.rows[0].telegram_id;
          // Keyingi safar tez topilishi uchun saqlaymiz
          await pool.query('UPDATE bookings SET telegram_id = $1 WHERE id = $2', [tgId, booking.id]).catch(() => {});
        }
      }
    } catch {}

    try {
      if (status === 'accepted') {
        const msg =
          `✅ Sizning broningiz qabul qilindi!\n\n` +
          `🌍 Tur: ${booking.title}\n` +
          `👤 Ism: ${booking.name}\n` +
          `👥 Mehmonlar: ${booking.guests} kishi\n` +
          `💰 Narx: $${booking.price}\n\n` +
          `Tez orada siz bilan bog'lanamiz. Savollar uchun adminga yozing.`;
        notifyTelegram(tgId, msg);
      } else if (status === 'rejected') {
        const msg =
          `❌ Afsuski, "${booking.title}" turingizga bron rad etildi.\n\n` +
          `Boshqa turlarni ko'rish uchun ilovani oching.`;
        notifyTelegram(tgId, msg);
      }
    } catch (notifyErr) {
      console.error('[notify] failed, continuing:', notifyErr.message);
    }

    return res.json({ booking });
  } catch (err) {
    console.error('[updateBooking] error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

module.exports = { getBookings, updateBooking };

const pool = require('../../db');
const https = require('https');

function notifyTelegram(telegramId, text) {
  const token = process.env.BOT_TOKEN;
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
    let query = 'SELECT * FROM bookings';
    const params = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY booked_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    const countRes = await pool.query(status ? 'SELECT COUNT(*) FROM bookings WHERE status=$1' : 'SELECT COUNT(*) FROM bookings', status ? [status] : []);
    return res.json({ bookings: rows, total: parseInt(countRes.rows[0].count) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
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

    return res.json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getBookings, updateBooking };

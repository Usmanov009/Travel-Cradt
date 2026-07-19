const { Booking, Package, TelegramUser, User } = require('../../models');
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
    const status = req.query.status || null;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const isCompanyAdmin = req.user.role === 'admin' && !!req.user.company_id;

    let filter = {};

    if (isCompanyAdmin) {
      const companyId = req.user.company_id;
      const packages = await Package.find({ company_id: companyId }, { title: 1 });
      const titles = packages.map(p => p.title);
      filter.$or = [
        { company_id: companyId },
        { title: { $in: titles } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ booked_at: -1 })
      .skip(offset)
      .limit(limit);

    return res.json({ bookings, total });
  } catch (err) {
    console.error('[getBookings] error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    console.log(`[updateBooking] id=${id} status=${status} content-type=${req.headers['content-type']}`);
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await Booking.findOneAndUpdate({ id: Number(id) }, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    const booking = updated;

    let tgId = booking.telegram_id;
    try {
      if (!tgId && booking.phone) {
        const cleanPhone = String(booking.phone).replace(/\s/g, '');
        const tgUser = await TelegramUser.findOne({ phone: cleanPhone });
        if (tgUser) {
          tgId = tgUser.telegram_id;
           await Booking.findByIdAndUpdate(booking._id, { telegram_id: tgId }).catch(() => {});
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

async function assignBookingCompany(req, res) {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Faqat super admin' });
    }
    const { id } = req.params;
    const { company_id } = req.body;
    const updated = await Booking.findOneAndUpdate({ id: Number(id) }, { company_id: company_id || null }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    return res.json({ updated: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getBookings, updateBooking, assignBookingCompany };

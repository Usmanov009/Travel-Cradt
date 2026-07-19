const { Booking, Package, TelegramUser } = require('../models');

async function getBookings(req, res) {
  try {
    const { telegram_id } = req.query;
    const filter = telegram_id ? { telegram_id: String(telegram_id) } : {};
    const bookings = await Booking.find(filter).sort({ booked_at: -1 }).limit(500);
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createBooking(req, res) {
  try {
    const { title, type, price, price_currency, name, phone, guests, days, status, telegram_id, travel_date, company_id, package_id } = req.body;
    console.log('[createBooking]', { title, name, phone, guests, status, company_id: company_id ?? null, package_id: package_id ?? null, price_currency: price_currency ?? 'USD' });

    let resolvedTelegramId = telegram_id || null;
    let finalName = name;
    let finalPhone = phone;

    try {
      if (!resolvedTelegramId && phone) {
        const cleanPhone = String(phone).replace(/\s/g, '');
        const tgUser = await TelegramUser.findOne({ phone: cleanPhone });
        if (tgUser) resolvedTelegramId = tgUser.telegram_id;
      }
    } catch {}

    if (resolvedTelegramId) {
      try {
        const registeredUser = await TelegramUser.findOne({ telegram_id: String(resolvedTelegramId) });
        if (registeredUser) {
          finalName = registeredUser.name || name;
          finalPhone = registeredUser.phone || phone;
          console.log('[createBooking] Using Telegram registered data:', { finalName, finalPhone });
        }
      } catch {}
    }

    let companyId = company_id || null;
    try {
      if (!companyId && title) {
        const pkg = await Package.findOne({ title, company_id: { $ne: null } });
        if (pkg) companyId = pkg.company_id;
      }
    } catch {}

    const safeCurrency = (price_currency === 'UZS' || price_currency === 'USD') ? price_currency : 'USD';

    const doc = new Booking({
      title,
      type,
      price,
      price_currency: safeCurrency,
      name: finalName,
      phone: finalPhone,
      guests: guests || 1,
      days: days || 1,
      status: status || 'pending',
      telegram_id: resolvedTelegramId,
      travel_date: travel_date || null,
      company_id: companyId,
      package_id: package_id || null,
    });

    try {
      const saved = await doc.save();
      console.log('[createBooking] saved id:', saved.id, 'company_id:', companyId, 'telegram_id:', resolvedTelegramId, 'package_id:', package_id);
      return res.status(201).json(saved);
    } catch (insertErr) {
      console.warn('[createBooking] full insert failed:', insertErr.message, '— trying fallback');
      const fallbackDoc = new Booking({
        title,
        type,
        price,
        price_currency: safeCurrency,
        name: finalName,
        phone: finalPhone,
        guests: guests || 1,
        days: days || 1,
        status: status || 'pending',
      });
      const saved = await fallbackDoc.save();
      console.log('[createBooking] fallback saved id:', saved.id);
      return res.status(201).json(saved);
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
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (guests !== undefined) updateFields.guests = guests;
    if (days !== undefined) updateFields.days = days;

    const updated = await Booking.findOneAndUpdate({ id: Number(id) }, updateFields, { new: true });
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Booking.findOneAndDelete({ id: Number(id) });
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    return res.json({ deleted: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };

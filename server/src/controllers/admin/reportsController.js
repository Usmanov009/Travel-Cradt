const { TourCompany, Booking, Package } = require('../../models');

// Barcha tur firmalarning daromati bo'yicha hisobot
async function getReports(req, res) {
  try {
    const companies = await TourCompany.find().sort({ created_at: -1 }).lean();

    // Har bir firma bo'yicha bron statistikasi (reset sanasidan keyingi bronlar hisobga olinadi)
    const bookingStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'tourcompanies',
          localField: 'company_id',
          foreignField: 'id',
          as: 'company',
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: {
            $gte: ['$booked_at', { $ifNull: ['$company.revenue_reset_at', new Date(0)] }],
          },
        },
      },
      {
        $group: {
          _id: '$company_id',
          total_bookings: { $sum: 1 },
          accepted_bookings: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          pending_bookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected_bookings: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
          pending_revenue: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$price', 0] } },
          last_booking_at: { $max: '$booked_at' },
        },
      },
    ]);

    // Har bir firma bo'yicha turlar soni
    const packageStats = await Package.aggregate([
      { $group: { _id: '$company_id', package_count: { $sum: 1 } } },
    ]);

    const bookingMap = new Map(bookingStats.map((s) => [s._id, s]));
    const packageMap = new Map(packageStats.map((s) => [s._id, s.package_count]));

    const rows = companies.map((c) => {
      const s = bookingMap.get(c.id) || {};
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        logo: c.logo || '',
        status: c.status,
        package_count: packageMap.get(c.id) || 0,
        total_bookings: s.total_bookings || 0,
        accepted_bookings: s.accepted_bookings || 0,
        pending_bookings: s.pending_bookings || 0,
        rejected_bookings: s.rejected_bookings || 0,
        total_revenue: s.total_revenue || 0,
        pending_revenue: s.pending_revenue || 0,
        last_booking_at: s.last_booking_at || null,
        revenue_reset_at: c.revenue_reset_at || null,
        reset_count: (c.revenue_history || []).length,
      };
    });

    // Umumiy jamlanma
    const totals = rows.reduce(
      (acc, r) => ({
        total_revenue: acc.total_revenue + r.total_revenue,
        pending_revenue: acc.pending_revenue + r.pending_revenue,
        total_bookings: acc.total_bookings + r.total_bookings,
        accepted_bookings: acc.accepted_bookings + r.accepted_bookings,
        pending_bookings: acc.pending_bookings + r.pending_bookings,
        rejected_bookings: acc.rejected_bookings + r.rejected_bookings,
      }),
      {
        total_revenue: 0,
        pending_revenue: 0,
        total_bookings: 0,
        accepted_bookings: 0,
        pending_bookings: 0,
        rejected_bookings: 0,
      }
    );

    return res.json({ companies: rows, totals, generated_at: new Date() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Bitta firmaning daromatini nollash
async function resetCompanyReport(req, res) {
  try {
    const companyId = parseInt(req.params.companyId);
    if (!companyId) return res.status(400).json({ error: 'Noto\'g\'ri firma ID' });

    const company = await TourCompany.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Firma topilmadi' });

    // Nollashdan oldingi joriy ko'rsatkichlarni tarixga saqlash
    const stats = await Booking.aggregate([
      { $match: { company_id: companyId } },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
          total_bookings: { $sum: 1 },
        },
      },
    ]);

    const current = stats[0] || { total_revenue: 0, total_bookings: 0 };

    company.revenue_history = company.revenue_history || [];
    company.revenue_history.push({
      reset_at: new Date(),
      total_revenue: current.total_revenue,
      total_bookings: current.total_bookings,
    });
    company.revenue_reset_at = new Date();
    await company.save();

    return res.json({
      ok: true,
      message: `${company.name} firmasining daromati nollandi`,
      archived: current,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Barcha firmalarning daromatini bir vaqtda nollash
async function resetAllReports(req, res) {
  try {
    const companies = await TourCompany.find();
    const now = new Date();
    let count = 0;

    for (const company of companies) {
      const stats = await Booking.aggregate([
        { $match: { company_id: company.id } },
        {
          $group: {
            _id: null,
            total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
            total_bookings: { $sum: 1 },
          },
        },
      ]);
      const current = stats[0] || { total_revenue: 0, total_bookings: 0 };

      company.revenue_history = company.revenue_history || [];
      company.revenue_history.push({
        reset_at: now,
        total_revenue: current.total_revenue,
        total_bookings: current.total_bookings,
      });
      company.revenue_reset_at = now;
      await company.save();
      count++;
    }

    return res.json({ ok: true, message: `${count} ta firmaning daromati nollandi`, count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getReports, resetCompanyReport, resetAllReports };
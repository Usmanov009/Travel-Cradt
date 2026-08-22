const { TourCompany, Booking, Package } = require('../../models');

const COMMISSION_RATE = 0.03; // 3% komissiya

// Barcha tur firmalarning daromati bo'yicha hisobot
async function getReports(req, res) {
  try {
    const companies = await TourCompany.find().sort({ created_at: -1 }).lean();

    // Har bir firma bo'yicha bron statistikasi
    // total_revenue — barcha vaqt bo'yicha daromad
    // commission_revenue — oxirgi nollash (komissiya) sanasidan keyingi qabul qilingan daromad
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
        $group: {
          _id: '$company_id',
          total_bookings: { $sum: 1 },
          accepted_bookings: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          pending_bookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected_bookings: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
          pending_revenue: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$price', 0] } },
          commission_revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'accepted'] },
                    {
                      $gte: [
                        '$booked_at',
                        { $ifNull: ['$company.commission_zeroed_at', new Date(0)] },
                      ],
                    },
                  ],
                },
                '$price',
                0,
              ],
            },
          },
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
      const commissionRevenue = s.commission_revenue || 0;
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
        commission_3pct: parseFloat((commissionRevenue * COMMISSION_RATE).toFixed(2)),
        last_booking_at: s.last_booking_at || null,
        commission_zeroed_at: c.commission_zeroed_at || null,
        reset_count: (c.revenue_history || []).length,
      };
    });

    // Umumiy jamlanma
    const totals = rows.reduce(
      (acc, r) => ({
        total_revenue: acc.total_revenue + r.total_revenue,
        pending_revenue: acc.pending_revenue + r.pending_revenue,
        total_commission: acc.total_commission + r.commission_3pct,
        total_bookings: acc.total_bookings + r.total_bookings,
        accepted_bookings: acc.accepted_bookings + r.accepted_bookings,
        pending_bookings: acc.pending_bookings + r.pending_bookings,
        rejected_bookings: acc.rejected_bookings + r.rejected_bookings,
      }),
      {
        total_revenue: 0,
        pending_revenue: 0,
        total_commission: 0,
        total_bookings: 0,
        accepted_bookings: 0,
        pending_bookings: 0,
        rejected_bookings: 0,
      }
    );
    totals.total_commission = parseFloat(totals.total_commission.toFixed(2));

    return res.json({
      companies: rows,
      totals,
      commission_rate: COMMISSION_RATE,
      generated_at: new Date(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Firmaning 3% komissiya summalarini nollash
async function resetCompanyReport(req, res) {
  try {
    const companyId = parseInt(req.params.companyId);
    if (!companyId) return res.status(400).json({ error: "Noto'g'ri firma ID" });

    const company = await TourCompany.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Firma topilmadi' });

    // Nollanadigan joriy komissiya summasini hisoblash
    const stats = await Booking.aggregate([
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
          company_id: companyId,
          status: 'accepted',
          $expr: {
            $gte: ['$booked_at', { $ifNull: ['$company.commission_zeroed_at', new Date(0)] }],
          },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    const currentRevenue = stats[0]?.revenue || 0;
    const currentCommission = parseFloat((currentRevenue * COMMISSION_RATE).toFixed(2));
    const now = new Date();

    company.revenue_history = company.revenue_history || [];
    company.revenue_history.push({
      reset_at: now,
      total_revenue: currentRevenue,
      total_bookings: stats[0]?.count || 0,
      commission_amount: currentCommission,
    });
    company.commission_zeroed_at = now;
    await company.save();

    return res.json({
      ok: true,
      message: `${company.name} firmasining ${currentCommission.toLocaleString()}$ komissiya summasi nollandi`,
      archived: { total_revenue: currentRevenue, commission_amount: currentCommission },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Barcha firmalarning 3% komissiya summalarini bir vaqtda nollash
async function resetAllReports(req, res) {
  try {
    const companies = await TourCompany.find();
    const now = new Date();
    let count = 0;
    let totalCommission = 0;

    for (const company of companies) {
      const stats = await Booking.aggregate([
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
            company_id: company.id,
            status: 'accepted',
            $expr: {
              $gte: ['$booked_at', { $ifNull: ['$company.commission_zeroed_at', new Date(0)] }],
            },
          },
        },
        { $group: { _id: null, revenue: { $sum: '$price' }, count: { $sum: 1 } } },
      ]);

      const currentRevenue = stats[0]?.revenue || 0;
      const currentCommission = parseFloat((currentRevenue * COMMISSION_RATE).toFixed(2));
      totalCommission += currentCommission;

      company.revenue_history = company.revenue_history || [];
      company.revenue_history.push({
        reset_at: now,
        total_revenue: currentRevenue,
        total_bookings: stats[0]?.count || 0,
        commission_amount: currentCommission,
      });
      company.commission_zeroed_at = now;
      await company.save();
      count++;
    }

    return res.json({
      ok: true,
      message: `${count} ta firmaning jami ${totalCommission.toFixed(2).toLocaleString()}$ komissiya summasi nollandi`,
      count,
      total_commission: parseFloat(totalCommission.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getReports, resetCompanyReport, resetAllReports };
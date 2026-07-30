const { Booking, Package } = require('../../models');

async function getRevenue(req, res) {
  try {
    const [summary, monthly, byType, topPackages] = await Promise.all([
      Booking.aggregate([
        {
          $group: {
            _id: null,
            total_revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
            pending_revenue: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$price', 0] } },
            total_bookings: { $sum: 1 },
            accepted_bookings: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            pending_bookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            rejected_bookings: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            booked_at: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$booked_at' } },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: '$_id', revenue: 1, bookings: 1 } },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: '$type',
            bookings: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
          },
        },
        { $project: { _id: 0, type: '$_id', bookings: 1, revenue: 1 } },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: '$title',
            bookings: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$price', 0] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, title: '$_id', bookings: 1, revenue: 1 } },
      ]),
    ]);

    return res.json({
      summary: summary[0] || {
        total_revenue: 0,
        pending_revenue: 0,
        total_bookings: 0,
        accepted_bookings: 0,
        pending_bookings: 0,
        rejected_bookings: 0,
      },
      monthly,
      byType,
      topPackages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getRevenue };

const { Booking, Package, User } = require('../../models');

async function getOverview(req, res) {
  try {
    const [bookingsCount, packagesCount, usersCount, revenueAgg, recent] = await Promise.all([
      Booking.countDocuments(),
      Package.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'accepted' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Booking.find().sort({ booked_at: -1 }).limit(10),
    ]);

    return res.json({
      totalBookings: bookingsCount,
      totalPackages: packagesCount,
      totalUsers: usersCount,
      totalRevenue: revenueAgg.length ? revenueAgg[0].total : 0,
      recentBookings: recent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getOverview };

const pool = require('../../db');

async function getOverview(req, res) {
  try {
    const [bookingsResult, packagesResult, usersResult, revenueResult, recentResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM packages'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COALESCE(SUM(price), 0) AS total FROM bookings WHERE status = 'accepted'"),
      pool.query('SELECT * FROM bookings ORDER BY booked_at DESC LIMIT 10'),
    ]);

    return res.json({
      totalBookings: parseInt(bookingsResult.rows[0].count),
      totalPackages: parseInt(packagesResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      recentBookings: recentResult.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getOverview };

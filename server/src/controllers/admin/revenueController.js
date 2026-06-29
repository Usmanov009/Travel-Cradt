const pool = require('../../db');

async function getRevenue(req, res) {
  try {
    const [totalRes, monthlyRes, byTypeRes, topPackagesRes] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN status='accepted' THEN price ELSE 0 END), 0) AS total_revenue,
          COALESCE(SUM(CASE WHEN status='pending' THEN price ELSE 0 END), 0) AS pending_revenue,
          COUNT(*) AS total_bookings,
          COUNT(CASE WHEN status='accepted' THEN 1 END) AS accepted_bookings,
          COUNT(CASE WHEN status='pending' THEN 1 END) AS pending_bookings,
          COUNT(CASE WHEN status='rejected' THEN 1 END) AS rejected_bookings
        FROM bookings
      `),
      pool.query(`
        SELECT
          TO_CHAR(booked_at, 'YYYY-MM') AS month,
          COALESCE(SUM(CASE WHEN status='accepted' THEN price ELSE 0 END), 0) AS revenue,
          COUNT(*) AS bookings
        FROM bookings
        WHERE booked_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month ASC
      `),
      pool.query(`
        SELECT type,
          COUNT(*) AS bookings,
          COALESCE(SUM(CASE WHEN status='accepted' THEN price ELSE 0 END), 0) AS revenue
        FROM bookings
        GROUP BY type
      `),
      pool.query(`
        SELECT title,
          COUNT(*) AS bookings,
          COALESCE(SUM(CASE WHEN status='accepted' THEN price ELSE 0 END), 0) AS revenue
        FROM bookings
        GROUP BY title
        ORDER BY revenue DESC
        LIMIT 10
      `),
    ]);

    return res.json({
      summary: totalRes.rows[0],
      monthly: monthlyRes.rows,
      byType: byTypeRes.rows,
      topPackages: topPackagesRes.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getRevenue };

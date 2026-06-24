const pool = require('../../db');

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
    return res.json({ booking: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getBookings, updateBooking };

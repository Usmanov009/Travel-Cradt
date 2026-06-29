const pool = require('../../db');

async function getCompanies(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT tc.*,
        (SELECT COUNT(*) FROM packages WHERE company_id = tc.id) as package_count,
        (SELECT COALESCE(SUM(b.price),0) FROM bookings b
          JOIN packages p ON b.title = p.title WHERE p.company_id = tc.id AND b.status='accepted'
        ) as revenue
      FROM tour_companies tc
      ORDER BY tc.created_at DESC
    `);
    return res.json({ companies: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateCompanyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await pool.query(
      'UPDATE tour_companies SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Company not found' });
    return res.json({ company: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE packages SET company_id = NULL WHERE company_id = $1', [id]);
    const { rows } = await pool.query('DELETE FROM tour_companies WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Company not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getCompanies, updateCompanyStatus, deleteCompany };

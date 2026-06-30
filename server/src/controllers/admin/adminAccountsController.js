const pool = require('../../db');
const bcrypt = require('bcryptjs');

async function listAdmins(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.blocked, u.created_at,
             u.company_id, tc.name AS company_name
      FROM users u
      LEFT JOIN tour_companies tc ON u.company_id = tc.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);
    return res.json({ admins: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createAdmin(req, res) {
  try {
    const { name, email, password, company_id } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email va parol talab qilinadi' });
    if (password.length < 6) return res.status(400).json({ error: 'Parol kamida 6 ta belgi bo\'lishi kerak' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, company_id)
       VALUES ($1, $2, $3, 'admin', $4)
       RETURNING id, name, email, role, company_id, created_at`,
      [name || 'Admin', email.toLowerCase(), hash, company_id || null]
    );
    return res.json({ admin: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Admin topilmadi' });
    if (rows[0].role === 'super_admin') return res.status(403).json({ error: 'Super adminni o\'chirish mumkin emas' });

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Parol kamida 6 ta belgi bo\'lishi kerak' });

    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Admin topilmadi' });
    if (rows[0].role === 'super_admin') return res.status(403).json({ error: 'Super admin paroli bu yerda o\'zgartirilmaydi' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
    return res.json({ updated: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listAdmins, createAdmin, deleteAdmin, resetPassword };

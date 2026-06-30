const pool = require('../../db');
const bcrypt = require('bcryptjs');

async function listAdmins(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.blocked, u.created_at,
             u.company_id, tc.name AS company_name, tc.phone AS company_phone,
             tc.status AS company_status
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

// Admin yaratilganda u o'zi tur firma bo'ladi:
// 1) tour_companies jadvalida yangi firma yaratiladi
// 2) users jadvalida shu firmaga bog'liq admin yaratiladi
async function createAdmin(req, res) {
  const client = await pool.connect();
  try {
    const { company_name, company_phone, company_address, email, password } = req.body;

    if (!company_name) return res.status(400).json({ error: 'Tur firma nomi talab qilinadi' });
    if (!email || !password) return res.status(400).json({ error: 'Email va parol talab qilinadi' });
    if (password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" });

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

    await client.query('BEGIN');

    // 1. Tur firma yaratish
    const companyRes = await client.query(
      `INSERT INTO tour_companies (name, email, password_hash, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, 'approved')
       RETURNING id, name`,
      [company_name, email.toLowerCase(), await bcrypt.hash(password, 10), company_phone || null, company_address || null]
    );
    const company = companyRes.rows[0];

    // 2. Admin user yaratish (tur firma bilan bog'liq)
    const hash = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, company_id)
       VALUES ($1, $2, $3, 'admin', $4)
       RETURNING id, name, email, role, company_id, created_at`,
      [company_name, email.toLowerCase(), hash, company.id]
    );

    await client.query('COMMIT');
    return res.json({ admin: { ...userRes.rows[0], company_name: company.name } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

async function deleteAdmin(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rows } = await client.query(
      'SELECT role, company_id FROM users WHERE id = $1', [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Admin topilmadi' });
    if (rows[0].role === 'super_admin') return res.status(403).json({ error: "Super adminni o'chirish mumkin emas" });

    await client.query('BEGIN');
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    // Bog'liq tur firmani ham o'chirish
    if (rows[0].company_id) {
      await client.query('UPDATE packages SET company_id = NULL WHERE company_id = $1', [rows[0].company_id]);
      await client.query('DELETE FROM tour_companies WHERE id = $1', [rows[0].company_id]);
    }
    await client.query('COMMIT');
    return res.json({ deleted: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

async function resetPassword(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" });

    const { rows } = await client.query('SELECT role, company_id FROM users WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Admin topilmadi' });
    if (rows[0].role === 'super_admin') return res.status(403).json({ error: "Super admin paroli bu yerda o'zgartirilmaydi" });

    const hash = await bcrypt.hash(password, 10);
    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
    // Tur firma parolini ham yangilash
    if (rows[0].company_id) {
      await client.query('UPDATE tour_companies SET password_hash = $1 WHERE id = $2', [hash, rows[0].company_id]);
    }
    await client.query('COMMIT');
    return res.json({ updated: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

module.exports = { listAdmins, createAdmin, deleteAdmin, resetPassword };

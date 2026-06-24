const pool = require('../../db');

async function getUsers(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, blocked, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ users: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function blockUser(req, res) {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET blocked = $1 WHERE id = $2 AND role != $3 RETURNING id, name, email, blocked',
      [blocked, id, 'admin']
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found or cannot block admin' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role != $2 RETURNING id',
      [id, 'admin']
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found or cannot delete admin' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getUsers, blockUser, deleteUser };

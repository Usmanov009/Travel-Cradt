const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.blocked) return res.status(403).json({ error: 'User is blocked' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== 'admin' && user.role !== 'super_admin') return res.status(403).json({ error: 'Not an admin' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, company_id: user.company_id || null },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, company_id: user.company_id || null },
    });
  } catch (err) {
    console.error('[admin login]', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}

module.exports = { login };

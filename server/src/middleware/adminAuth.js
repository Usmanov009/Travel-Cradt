const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function adminAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ error: 'Invalid token' });

    const user = await User.findOne({ id: decoded.id });
    if (!user) return res.status(401).json({ error: 'Invalid token user' });
    if (user.role !== 'admin' && user.role !== 'super_admin') return res.status(403).json({ error: 'Not an admin' });
    if (user.blocked) return res.status(403).json({ error: 'User blocked' });

    req.user = { id: user.id, email: user.email, role: user.role, company_id: user.company_id || null };
    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = adminAuth;

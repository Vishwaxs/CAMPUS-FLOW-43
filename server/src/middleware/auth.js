const { getDb } = require('../models/database');

// Token-based auth middleware — looks up Bearer token in sessions table
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  const db = getDb();
  const session = db.prepare(`
    SELECT u.* FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token);

  if (!session) {
    req.user = null;
    return next();
  }

  session.interests = JSON.parse(session.interests || '[]');
  delete session.password_hash;
  req.user = session;
  next();
}

// Role-check middleware factory
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };

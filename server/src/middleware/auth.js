const { v4: uuidv4 } = require('uuid');

// Simulated auth middleware. In production, this would validate JWT tokens.
// For the hackathon MVP, we use a simple user-id header to switch personas.
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    // Default to first student for demo convenience
    req.user = null;
    return next();
  }

  const { getDb } = require('../models/database');
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  user.interests = JSON.parse(user.interests || '[]');
  req.user = user;
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

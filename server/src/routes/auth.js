const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const router = express.Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { email, password, name, role, department, year, interests } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const validRoles = ['student', 'organizer', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'student';

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const id = uuidv4();
  const password_hash = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, department, year, interests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, email, password_hash, name, userRole,
    department || null, year ? parseInt(year) : null,
    JSON.stringify(interests || [])
  );

  // Create session
  const token = uuidv4();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, id);

  const user = db.prepare(
    'SELECT id, email, name, role, department, year, interests, engagement_score, created_at FROM users WHERE id = ?'
  ).get(id);
  user.interests = JSON.parse(user.interests || '[]');

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Create session
  const token = uuidv4();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);

  const safeUser = {
    id: user.id, email: user.email, name: user.name, role: user.role,
    department: user.department, year: user.year,
    interests: JSON.parse(user.interests || '[]'),
    engagement_score: user.engagement_score, created_at: user.created_at
  };

  res.json({ token, user: safeUser });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

// GET /api/auth/me — get current user from token
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

module.exports = router;

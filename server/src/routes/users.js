const express = require('express');
const { getDb } = require('../models/database');
const router = express.Router();

// GET /api/users — list all users (admin)
router.get('/', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, name, role, department, year, interests, engagement_score, created_at FROM users ORDER BY name').all();
  users.forEach(u => { u.interests = JSON.parse(u.interests || '[]'); });
  res.json(users);
});

// GET /api/users/:id — get single user
router.get('/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, role, department, year, interests, engagement_score, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.interests = JSON.parse(user.interests || '[]');
  res.json(user);
});

// GET /api/users/:id/registrations — user's registrations
router.get('/:id/registrations', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, e.title as event_title, e.slug as event_slug, e.event_type, e.start_date, e.status as event_status
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.registered_at DESC
  `).all(req.params.id);
  res.json(rows);
});

// GET /api/users/:id/participation — participation history (sustainability)
router.get('/:id/participation', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.*, e.title as event_title
    FROM participation_log p
    JOIN events e ON p.event_id = e.id
    WHERE p.user_id = ?
    ORDER BY p.academic_year DESC
  `).all(req.params.id);
  res.json(rows);
});

module.exports = router;

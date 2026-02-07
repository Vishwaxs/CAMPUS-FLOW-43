const express = require('express');
const { getDb } = require('../models/database');
const { MODULES } = require('../config/modules');
const { THEME_PRESETS } = require('../config/themes');
const router = express.Router();

// GET /api/platform/modules — list all available modules
router.get('/modules', (req, res) => {
  const db = getDb();
  const modules = db.prepare('SELECT * FROM module_registry ORDER BY sort_order').all();
  modules.forEach(m => { m.config_schema = JSON.parse(m.config_schema || '{}'); });
  res.json(modules);
});

// GET /api/platform/themes — list all theme presets
router.get('/themes', (req, res) => {
  res.json(THEME_PRESETS);
});

// GET /api/platform/stats — platform-wide analytics
router.get('/stats', (req, res) => {
  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  const activeEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status IN ('published','ongoing')").get().count;
  const totalRegistrations = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status != 'cancelled'").get().count;
  const eventsByType = db.prepare('SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type').all();
  const eventsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM events GROUP BY status').all();
  const topDepartments = db.prepare('SELECT department, COUNT(*) as count FROM events WHERE department IS NOT NULL GROUP BY department ORDER BY count DESC LIMIT 5').all();

  res.json({
    totalUsers,
    totalEvents,
    activeEvents,
    totalRegistrations,
    eventsByType,
    eventsByStatus,
    topDepartments
  });
});

// GET /api/platform/recommendations/:userId — AI-assisted recommendations
router.get('/recommendations/:userId', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const interests = JSON.parse(user.interests || '[]');

  // Simple tag-matching recommendation (no external AI call needed for MVP)
  let events = db.prepare(`
    SELECT e.*, u.name as organizer_name,
      (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != 'cancelled') as registration_count
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.status IN ('published', 'ongoing')
    AND e.id NOT IN (SELECT event_id FROM registrations WHERE user_id = ? AND status != 'cancelled')
    ORDER BY e.start_date ASC
  `).all(req.params.userId);

  // Score events by interest match
  events = events.map(e => {
    const tags = JSON.parse(e.tags || '[]');
    const matchScore = interests.reduce((score, interest) => {
      return score + (tags.some(t => t.toLowerCase().includes(interest.toLowerCase())) ? 1 : 0);
    }, 0);
    // Boost by department match
    const deptBoost = e.department === user.department ? 0.5 : 0;
    e.relevance_score = matchScore + deptBoost;
    e.tags = tags;
    e.theme_config = undefined;
    e.module_configs = undefined;
    e.enabled_modules = JSON.parse(e.enabled_modules || '[]');
    return e;
  });

  events.sort((a, b) => b.relevance_score - a.relevance_score);
  res.json(events.slice(0, 10));
});

module.exports = router;

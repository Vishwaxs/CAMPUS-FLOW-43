const express = require('express');
const { getDb } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// GET /api/events — list events with filters
router.get('/', (req, res) => {
  const db = getDb();
  const { status, type, department, tag, search } = req.query;

  let sql = `SELECT e.*, u.name as organizer_name,
    (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != 'cancelled') as registration_count
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE 1=1`;
  const params = [];

  if (status) { sql += ' AND e.status = ?'; params.push(status); }
  if (type) { sql += ' AND e.event_type = ?'; params.push(type); }
  if (department) { sql += ' AND e.department = ?'; params.push(department); }
  if (tag) { sql += ' AND e.tags LIKE ?'; params.push(`%"${tag}"%`); }
  if (search) { sql += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  sql += ' ORDER BY e.start_date DESC';

  const events = db.prepare(sql).all(...params);
  events.forEach(e => {
    e.tags = JSON.parse(e.tags || '[]');
    e.enabled_modules = JSON.parse(e.enabled_modules || '[]');
    // Don't send full theme_config in list view — keep payloads small
    e.theme_config = undefined;
    e.module_configs = undefined;
  });
  res.json(events);
});

// GET /api/events/:slug — full event detail (microsite data)
router.get('/:slug', (req, res) => {
  const db = getDb();
  const event = db.prepare(`
    SELECT e.*, u.name as organizer_name
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.slug = ?
  `).get(req.params.slug);

  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.tags = JSON.parse(event.tags || '[]');
  event.theme_config = JSON.parse(event.theme_config || '{}');
  event.enabled_modules = JSON.parse(event.enabled_modules || '[]');
  event.module_configs = JSON.parse(event.module_configs || '{}');

  // Attach module data based on enabled modules
  const modules = {};

  if (event.enabled_modules.includes('schedule')) {
    modules.schedule = db.prepare('SELECT * FROM schedule_items WHERE event_id = ? ORDER BY sort_order')
      .all(event.id);
  }
  if (event.enabled_modules.includes('announcements')) {
    modules.announcements = db.prepare('SELECT * FROM announcements WHERE event_id = ? ORDER BY created_at DESC')
      .all(event.id);
  }
  if (event.enabled_modules.includes('registration')) {
    modules.registration = {
      count: db.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?').get(event.id, 'cancelled').count,
      max: event.max_participants
    };
  }
  if (event.enabled_modules.includes('teams')) {
    modules.teams = db.prepare(`
      SELECT t.*, u.name as leader_name,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      JOIN users u ON t.leader_id = u.id
      WHERE t.event_id = ?
    `).all(event.id);
  }
  if (event.enabled_modules.includes('voting')) {
    const polls = db.prepare('SELECT * FROM vote_polls WHERE event_id = ?').all(event.id);
    polls.forEach(p => {
      p.options = JSON.parse(p.options || '[]');
      p.vote_counts = db.prepare('SELECT option_index, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY option_index').all(p.id);
    });
    modules.voting = polls;
  }
  if (event.enabled_modules.includes('leaderboard')) {
    modules.leaderboard = db.prepare(`
      SELECT t.name, t.id,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t WHERE t.event_id = ?
    `).all(event.id);
  }

  // Gather event roles
  const roles = db.prepare(`
    SELECT er.*, u.name as user_name
    FROM event_roles er
    JOIN users u ON er.user_id = u.id
    WHERE er.event_id = ?
  `).all(event.id);

  event.modules = modules;
  event.roles = roles;
  res.json(event);
});

// POST /api/events — create event (organizer/admin)
router.post('/', (req, res) => {
  if (!req.user || !['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only organizers and admins can create events' });
  }

  const db = getDb();
  const {
    title, description, short_description, event_type, department,
    start_date, end_date, venue, max_participants, tags,
    theme_config, enabled_modules, module_configs
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

  db.prepare(`
    INSERT INTO events (id, title, slug, description, short_description, event_type, status, organizer_id, department, start_date, end_date, venue, max_participants, tags, theme_config, enabled_modules, module_configs)
    VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, slug,
    description || '', short_description || '', event_type || 'general',
    req.user.id, department || '',
    start_date || null, end_date || null, venue || '',
    max_participants || 100,
    JSON.stringify(tags || []),
    JSON.stringify(theme_config || {}),
    JSON.stringify(enabled_modules || ['registration', 'schedule', 'announcements']),
    JSON.stringify(module_configs || {})
  );

  // Auto-assign creator as event head
  db.prepare('INSERT INTO event_roles (id, event_id, user_id, role) VALUES (?, ?, ?, ?)').run(uuidv4(), id, req.user.id, 'head');

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  event.tags = JSON.parse(event.tags);
  event.enabled_modules = JSON.parse(event.enabled_modules);
  event.theme_config = JSON.parse(event.theme_config);
  event.module_configs = JSON.parse(event.module_configs);
  res.status(201).json(event);
});

// PATCH /api/events/:slug — update event
router.patch('/:slug', (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const allowed = ['title', 'description', 'short_description', 'event_type', 'status', 'department', 'start_date', 'end_date', 'venue', 'max_participants', 'tags', 'theme_config', 'enabled_modules', 'module_configs', 'cover_image'];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      const val = typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : req.body[key];
      values.push(val);
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  updates.push("updated_at = datetime('now')");
  values.push(event.slug);

  db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE slug = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  updated.tags = JSON.parse(updated.tags || '[]');
  updated.enabled_modules = JSON.parse(updated.enabled_modules || '[]');
  updated.theme_config = JSON.parse(updated.theme_config || '{}');
  updated.module_configs = JSON.parse(updated.module_configs || '{}');
  res.json(updated);
});

// POST /api/events/:slug/register — student registers
router.post('/:slug/register', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });

  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.status !== 'published' && event.status !== 'ongoing') {
    return res.status(400).json({ error: 'Event is not accepting registrations' });
  }

  const existing = db.prepare('SELECT * FROM registrations WHERE event_id = ? AND user_id = ?').get(event.id, req.user.id);
  if (existing) return res.status(409).json({ error: 'Already registered', registration: existing });

  const count = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?').get(event.id, 'cancelled').count;
  const moduleConfigs = JSON.parse(event.module_configs || '{}');
  const waitlistEnabled = moduleConfigs.registration?.waitlist_enabled;
  let status = 'registered';
  if (event.max_participants && count >= event.max_participants) {
    if (waitlistEnabled) {
      status = 'waitlisted';
    } else {
      return res.status(400).json({ error: 'Event is full' });
    }
  }

  const id = uuidv4();
  db.prepare('INSERT INTO registrations (id, event_id, user_id, status) VALUES (?, ?, ?, ?)').run(id, event.id, req.user.id, status);

  res.status(201).json({ id, event_id: event.id, user_id: req.user.id, status });
});

// DELETE /api/events/:slug/register — cancel registration
router.delete('/:slug/register', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });

  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  db.prepare("UPDATE registrations SET status = 'cancelled' WHERE event_id = ? AND user_id = ?").run(event.id, req.user.id);
  res.json({ success: true });
});

// GET /api/events/:slug/registrations — list registrations (organizer)
router.get('/:slug/registrations', (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const registrations = db.prepare(`
    SELECT r.*, u.name as user_name, u.email as user_email, u.department as user_department
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
  `).all(event.id);
  res.json(registrations);
});

// POST /api/events/:slug/announcements
router.post('/:slug/announcements', (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, body, priority } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

  const id = uuidv4();
  db.prepare('INSERT INTO announcements (id, event_id, title, body, priority) VALUES (?, ?, ?, ?, ?)').run(id, event.id, title, body, priority || 'normal');
  res.status(201).json({ id, event_id: event.id, title, body, priority: priority || 'normal' });
});

// POST /api/events/:slug/schedule
router.post('/:slug/schedule', (req, res) => {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, description, start_time, end_time, venue, speaker, sort_order } = req.body;
  if (!title || !start_time) return res.status(400).json({ error: 'Title and start_time required' });

  const id = uuidv4();
  db.prepare('INSERT INTO schedule_items (id, event_id, title, description, start_time, end_time, venue, speaker, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, event.id, title, description || '', start_time, end_time || null, venue || '', speaker || '', sort_order || 0);
  res.status(201).json({ id, event_id: event.id, title });
});

module.exports = router;

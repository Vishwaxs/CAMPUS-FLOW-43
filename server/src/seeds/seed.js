const { getDb } = require('../models/database');
const { MODULES } = require('../config/modules');
const { THEME_PRESETS } = require('../config/themes');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// All demo users use this password
const DEMO_PASSWORD = 'pass123';
const DEMO_HASH = hashPassword(DEMO_PASSWORD);

function seed() {
  const db = getDb();

  console.log('[SEED] Clearing existing data...');
  db.exec(`
    DELETE FROM votes; DELETE FROM vote_polls; DELETE FROM schedule_items;
    DELETE FROM announcements; DELETE FROM event_roles; DELETE FROM team_members;
    DELETE FROM teams; DELETE FROM registrations; DELETE FROM participation_log;
    DELETE FROM events; DELETE FROM sessions; DELETE FROM users; DELETE FROM module_registry;
  `);

  // 1. Seed module registry
  console.log('[SEED] Registering platform modules...');
  const insertModule = db.prepare(`
    INSERT INTO module_registry (id, name, description, icon, default_enabled, config_schema, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of MODULES) {
    insertModule.run(m.id, m.name, m.description, m.icon, m.default_enabled, m.config_schema, m.sort_order);
  }

  // 2. Seed users
  console.log('[SEED] Creating users...');
  console.log(`  [INFO] All demo accounts use password: "${DEMO_PASSWORD}"`);
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, department, year, interests, engagement_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = {
    admin: { id: uuidv4(), email: 'admin@campus.edu', name: 'Platform Admin', role: 'admin', department: 'IT', year: null, interests: '[]', score: 0 },
    organizer1: { id: uuidv4(), email: 'priya@campus.edu', name: 'Priya Sharma', role: 'organizer', department: 'CSE', year: 3, interests: '["tech","hackathons"]', score: 250 },
    organizer2: { id: uuidv4(), email: 'rahul@campus.edu', name: 'Rahul Mehta', role: 'organizer', department: 'ECE', year: 4, interests: '["cultural","music"]', score: 180 },
    student1: { id: uuidv4(), email: 'ananya@campus.edu', name: 'Ananya Verma', role: 'student', department: 'CSE', year: 2, interests: '["tech","ai","hackathons","workshops"]', score: 120 },
    student2: { id: uuidv4(), email: 'karthik@campus.edu', name: 'Karthik Nair', role: 'student', department: 'ME', year: 3, interests: '["sports","cultural","music"]', score: 80 },
    student3: { id: uuidv4(), email: 'sara@campus.edu', name: 'Sara Khan', role: 'student', department: 'CSE', year: 1, interests: '["tech","design","workshops"]', score: 45 },
    student4: { id: uuidv4(), email: 'dev@campus.edu', name: 'Dev Patel', role: 'student', department: 'ECE', year: 2, interests: '["hackathons","robotics","tech"]', score: 200 },
    student5: { id: uuidv4(), email: 'nisha@campus.edu', name: 'Nisha Reddy', role: 'student', department: 'MBA', year: 1, interests: '["management","cultural","sports"]', score: 60 }
  };

  for (const u of Object.values(users)) {
    insertUser.run(u.id, u.email, DEMO_HASH, u.name, u.role, u.department, u.year, u.interests, u.score);
  }

  // 3. Seed events
  console.log('[SEED] Creating events...');
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, slug, description, short_description, event_type, status, organizer_id, department, start_date, end_date, venue, max_participants, tags, theme_config, enabled_modules, module_configs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = {
    hackathon: {
      id: uuidv4(),
      title: 'HackCampus 2026',
      slug: 'hackcampus-2026',
      description: 'The flagship 36-hour hackathon bringing together the brightest minds on campus. Build, break, innovate. Open to all departments. Prizes worth ₹1,00,000.',
      short_description: '36-hour campus hackathon — Build. Break. Innovate.',
      event_type: 'hackathon',
      status: 'published',
      organizer_id: users.organizer1.id,
      department: 'CSE',
      start_date: '2026-03-15T09:00:00',
      end_date: '2026-03-16T21:00:00',
      venue: 'Main Auditorium + CS Labs',
      max_participants: 200,
      tags: '["hackathon","coding","ai","web","mobile"]',
      theme_config: JSON.stringify(THEME_PRESETS.hackathon),
      enabled_modules: '["registration","schedule","announcements","teams","leaderboard","checkin"]',
      module_configs: JSON.stringify({
        teams: { max_team_size: 4, min_team_size: 2, allow_solo: false },
        registration: { max_participants: 200, waitlist_enabled: true },
        leaderboard: { show_scores: true, update_frequency: 'hourly' }
      })
    },
    techfest: {
      id: uuidv4(),
      title: 'TechVista 2026',
      slug: 'techvista-2026',
      description: 'Annual technical festival featuring workshops, talks, competitions, and exhibitions. Three days of technology and innovation.',
      short_description: 'Annual tech fest — Workshops, Talks, Competitions.',
      event_type: 'fest',
      status: 'published',
      organizer_id: users.organizer1.id,
      department: 'CSE',
      start_date: '2026-04-10T10:00:00',
      end_date: '2026-04-12T18:00:00',
      venue: 'Central Campus',
      max_participants: 500,
      tags: '["fest","technology","workshops","competitions"]',
      theme_config: JSON.stringify(THEME_PRESETS.default),
      enabled_modules: '["registration","schedule","announcements","voting","checkin"]',
      module_configs: JSON.stringify({
        registration: { max_participants: 500, waitlist_enabled: true },
        voting: { anonymous: true, show_results_live: true }
      })
    },
    cultural: {
      id: uuidv4(),
      title: 'Rang Tarang',
      slug: 'rang-tarang-2026',
      description: 'The annual cultural extravaganza. Dance, music, drama, art — all under one roof. Celebrate creativity and tradition.',
      short_description: 'Cultural fest — Dance, Music, Drama, Art.',
      event_type: 'cultural',
      status: 'published',
      organizer_id: users.organizer2.id,
      department: 'Cultural Committee',
      start_date: '2026-02-28T16:00:00',
      end_date: '2026-03-02T22:00:00',
      venue: 'Open Air Theatre + Mini Audi',
      max_participants: 800,
      tags: '["cultural","dance","music","drama","art"]',
      theme_config: JSON.stringify(THEME_PRESETS.cultural),
      enabled_modules: '["registration","schedule","announcements","voting"]',
      module_configs: JSON.stringify({
        registration: { max_participants: 800 },
        voting: { anonymous: false, show_results_live: true }
      })
    },
    workshop: {
      id: uuidv4(),
      title: 'AI/ML Bootcamp',
      slug: 'aiml-bootcamp-2026',
      description: 'Intensive 2-day bootcamp on Machine Learning and AI fundamentals. Hands-on sessions with real datasets. Certificates provided.',
      short_description: '2-day hands-on AI/ML workshop with certificates.',
      event_type: 'workshop',
      status: 'draft',
      organizer_id: users.organizer1.id,
      department: 'CSE',
      start_date: '2026-05-01T09:00:00',
      end_date: '2026-05-02T17:00:00',
      venue: 'CS Lab 1 & 2',
      max_participants: 60,
      tags: '["workshop","ai","ml","python","data-science"]',
      theme_config: JSON.stringify(THEME_PRESETS.workshop),
      enabled_modules: '["registration","schedule","announcements","checkin"]',
      module_configs: JSON.stringify({
        registration: { max_participants: 60, requires_approval: true }
      })
    },
    sports: {
      id: uuidv4(),
      title: 'Campus Premier League',
      slug: 'campus-premier-league-2026',
      description: 'Inter-department cricket tournament. 8 teams, 2 weeks, 1 champion. Register your department team now!',
      short_description: 'Inter-department cricket tournament.',
      event_type: 'sports',
      status: 'archived',
      organizer_id: users.organizer2.id,
      department: 'Sports Committee',
      start_date: '2025-11-01T08:00:00',
      end_date: '2025-11-14T18:00:00',
      venue: 'Cricket Ground',
      max_participants: 120,
      tags: '["sports","cricket","tournament","inter-department"]',
      theme_config: JSON.stringify(THEME_PRESETS.sports),
      enabled_modules: '["registration","schedule","announcements","teams","leaderboard"]',
      module_configs: JSON.stringify({
        teams: { max_team_size: 15, min_team_size: 11, allow_solo: false },
        leaderboard: { show_scores: true, update_frequency: 'manual' }
      })
    }
  };

  for (const e of Object.values(events)) {
    insertEvent.run(e.id, e.title, e.slug, e.description, e.short_description, e.event_type, e.status, e.organizer_id, e.department, e.start_date, e.end_date, e.venue, e.max_participants, e.tags, e.theme_config, e.enabled_modules, e.module_configs);
  }

  // 4. Seed registrations
  console.log('[SEED] Registering students for events...');
  const insertReg = db.prepare(`
    INSERT INTO registrations (id, event_id, user_id, status) VALUES (?, ?, ?, ?)
  `);
  insertReg.run(uuidv4(), events.hackathon.id, users.student1.id, 'registered');
  insertReg.run(uuidv4(), events.hackathon.id, users.student4.id, 'registered');
  insertReg.run(uuidv4(), events.cultural.id, users.student2.id, 'registered');
  insertReg.run(uuidv4(), events.cultural.id, users.student5.id, 'registered');
  insertReg.run(uuidv4(), events.techfest.id, users.student1.id, 'registered');
  insertReg.run(uuidv4(), events.techfest.id, users.student3.id, 'registered');
  insertReg.run(uuidv4(), events.sports.id, users.student2.id, 'attended');

  // 5. Seed schedule items
  console.log('[SEED] Adding schedule items...');
  const insertSchedule = db.prepare(`
    INSERT INTO schedule_items (id, event_id, title, description, start_time, end_time, venue, speaker, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSchedule.run(uuidv4(), events.hackathon.id, 'Opening Ceremony', 'Welcome and rules briefing', '2026-03-15T09:00:00', '2026-03-15T10:00:00', 'Main Auditorium', 'Dean of Engineering', 1);
  insertSchedule.run(uuidv4(), events.hackathon.id, 'Hacking Begins', 'Teams start building', '2026-03-15T10:00:00', null, 'CS Labs', null, 2);
  insertSchedule.run(uuidv4(), events.hackathon.id, 'Midnight Snacks + Mentor Session', 'Refuel and get mentorship', '2026-03-16T00:00:00', '2026-03-16T01:00:00', 'CS Lobby', null, 3);
  insertSchedule.run(uuidv4(), events.hackathon.id, 'Final Presentations', 'Demo your project to judges', '2026-03-16T17:00:00', '2026-03-16T20:00:00', 'Main Auditorium', null, 4);
  insertSchedule.run(uuidv4(), events.hackathon.id, 'Awards & Closing', 'Winners announced', '2026-03-16T20:00:00', '2026-03-16T21:00:00', 'Main Auditorium', 'Chief Guest', 5);

  // 6. Seed announcements
  console.log('[SEED] Adding announcements...');
  const insertAnn = db.prepare(`
    INSERT INTO announcements (id, event_id, title, body, priority) VALUES (?, ?, ?, ?, ?)
  `);
  insertAnn.run(uuidv4(), events.hackathon.id, 'Registration Open!', 'HackCampus 2026 registrations are now live. Form your teams and register before March 10th.', 'high');
  insertAnn.run(uuidv4(), events.hackathon.id, 'Problem Statements Released', 'Check the event page for this year\'s problem statements. Choose wisely!', 'normal');
  insertAnn.run(uuidv4(), events.cultural.id, 'Auditions Schedule', 'Dance and drama auditions are scheduled for Feb 20-22. Check the schedule tab.', 'normal');

  // 7. Seed participation history (sustainability demo)
  console.log('[SEED] Adding historical participation data...');
  const insertParticipation = db.prepare(`
    INSERT INTO participation_log (id, user_id, event_id, academic_year, event_type, role, points_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertParticipation.run(uuidv4(), users.student1.id, events.sports.id, '2024-25', 'sports', 'participant', 20);
  insertParticipation.run(uuidv4(), users.student4.id, events.sports.id, '2024-25', 'hackathon', 'participant', 50);
  insertParticipation.run(uuidv4(), users.student2.id, events.sports.id, '2024-25', 'cultural', 'volunteer', 30);
  insertParticipation.run(uuidv4(), users.student1.id, events.sports.id, '2023-24', 'workshop', 'participant', 15);

  // 8. Seed event roles
  console.log('[SEED] Assigning event roles...');
  const insertRole = db.prepare(`
    INSERT INTO event_roles (id, event_id, user_id, role) VALUES (?, ?, ?, ?)
  `);
  insertRole.run(uuidv4(), events.hackathon.id, users.organizer1.id, 'head');
  insertRole.run(uuidv4(), events.cultural.id, users.organizer2.id, 'head');
  insertRole.run(uuidv4(), events.hackathon.id, users.student4.id, 'volunteer');

  console.log('[SEED] Done! Database seeded successfully.');
  console.log(`  - ${MODULES.length} modules registered`);
  console.log(`  - ${Object.keys(users).length} users created`);
  console.log(`  - ${Object.keys(events).length} events created`);
}

seed();

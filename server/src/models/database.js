const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'campus_flow.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    -- Users: students, organizers, admins
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'organizer', 'admin')),
      department TEXT,
      year INTEGER,
      interests TEXT DEFAULT '[]',
      avatar_url TEXT,
      engagement_score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Events: the core entity with lifecycle + theme config
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      short_description TEXT,
      event_type TEXT NOT NULL DEFAULT 'general' CHECK(event_type IN ('fest','workshop','hackathon','seminar','competition','cultural','sports','general')),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','ongoing','archived')),
      organizer_id TEXT NOT NULL,
      department TEXT,
      start_date TEXT,
      end_date TEXT,
      venue TEXT,
      max_participants INTEGER,
      tags TEXT DEFAULT '[]',
      cover_image TEXT,

      -- Theme configuration (JSON)
      theme_config TEXT DEFAULT '{}',
      -- Enabled modules (JSON array of module IDs)
      enabled_modules TEXT DEFAULT '["registration","schedule","announcements"]',
      -- Module-specific configs (JSON object keyed by module ID)
      module_configs TEXT DEFAULT '{}',

      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );

    -- Registrations
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'registered' CHECK(status IN ('registered','waitlisted','cancelled','attended')),
      team_id TEXT,
      registered_at TEXT DEFAULT (datetime('now')),
      checked_in_at TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(event_id, user_id)
    );

    -- Teams (for hackathons, competitions)
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      leader_id TEXT NOT NULL,
      max_size INTEGER DEFAULT 4,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (leader_id) REFERENCES users(id)
    );

    -- Team members
    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Event roles (coordinators, volunteers)
    CREATE TABLE IF NOT EXISTS event_roles (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('head','coordinator','volunteer')),
      assigned_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(event_id, user_id)
    );

    -- Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    -- Schedule items
    CREATE TABLE IF NOT EXISTS schedule_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      venue TEXT,
      speaker TEXT,
      track TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    -- Votes (for live voting module)
    CREATE TABLE IF NOT EXISTS vote_polls (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      poll_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      voted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (poll_id) REFERENCES vote_polls(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(poll_id, user_id)
    );

    -- Participation history (sustainability: persists year over year)
    CREATE TABLE IF NOT EXISTS participation_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      event_type TEXT,
      role TEXT DEFAULT 'participant',
      points_earned INTEGER DEFAULT 0,
      certificate_issued INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    -- Platform-level module registry
    CREATE TABLE IF NOT EXISTS module_registry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      default_enabled INTEGER DEFAULT 0,
      config_schema TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_participation_user ON participation_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_participation_year ON participation_log(academic_year);
  `);
}

module.exports = { getDb };

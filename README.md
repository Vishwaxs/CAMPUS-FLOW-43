# CAMPUS FLOW

### "Campus as a Platform" — Modular, Theme-Agnostic Campus Event Infrastructure

> Campus Flow is not an event app. It's not a CMS. It's a **reusable platform**
> that acts as the operating system for all campus activities — year after year,
> event after event. Think **Shopify for campus events**: same backend, same logic,
> different events, different themes.

---

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Seed the database with demo data
npm run seed

# 3. Start both server and client
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- Use the **user switcher** in the sidebar to swap between Student / Organizer / Admin personas.

---

## 1. Vision & Concept

**The Problem:**
Every year, campus events are organized through fragmented channels — WhatsApp groups,
Instagram stories, emails, posters, Google Forms. Each new fest rebuilds systems from
scratch. Knowledge dies with graduating batches.

**The Solution:**
Campus Flow provides **persistent, modular infrastructure** where:
- Students have a single source of truth for all campus activity
- Organizers get a no-code event builder with plug-and-play modules
- The platform retains data and configuration year over year

**One platform. Any event. Any theme. Any year.**

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMPUS FLOW PLATFORM                        │
├────────────────┬───────────────────────┬────────────────────────────┤
│   STUDENT      │    ORGANIZER          │     PLATFORM / ADMIN       │
│   EXPERIENCE   │    EXPERIENCE         │     LAYER                  │
│                │                       │                            │
│  - Dashboard   │  - Event Builder      │  - Module Registry         │
│  - Discovery   │  - Module Toggles     │  - Theme Engine            │
│  - Register    │  - Theme Config       │  - Analytics               │
│  - History     │  - Manage Lifecycle   │  - Sustainability Data     │
│  - QR Check-in │  - Announcements      │  - Year-over-Year Store    │
│  - Voting      │  - Registration Mgmt  │                            │
├────────────────┴───────────────────────┴────────────────────────────┤
│                      DYNAMIC MODULE SYSTEM                         │
│  Registration │ Schedule │ Announcements │ Teams │ Voting │ QR     │
│  Leaderboard  │ (extensible — add new modules without code change) │
├─────────────────────────────────────────────────────────────────────┤
│                      THEME-AGNOSTIC ENGINE                         │
│  JSON config → CSS custom properties → Event microsite renders     │
│  Same backend logic → Different visual identity per event          │
├─────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                 │
│  Users │ Events │ Registrations │ Teams │ Participation Log        │
│  Module Registry │ Announcements │ Schedule │ Votes                │
│                    SQLite (portable, zero-config)                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Is a Platform, Not a CMS
| CMS (WordPress-like) | Campus Flow |
|---|---|
| Content-first | Participation-first |
| Pages & posts | Events with lifecycle (Draft→Published→Ongoing→Archived) |
| Static plugins | Dynamic modules toggled per-event |
| Same theme everywhere | Each event gets its own visual identity |
| No event logic | Built-in registration, teams, voting, check-in |
| No sustainability story | Year-over-year data persistence |

---

## 3. Core Features by Layer

### Layer 1: Student Experience
| Feature | Description |
|---|---|
| Dashboard | Personal command center showing registered events, engagement score, recommendations |
| Event Discovery | Filter by type, department, status, search. Visual cards with fill-rate indicators |
| Event Microsite | Themed event page with dynamically rendered modules |
| Registration | One-click RSVP with waitlist support |
| Participation History | Year-over-year record that persists across batches |
| Recommendations | Interest-based event suggestions (AI-assisted) |

### Layer 2: Organizer Experience
| Feature | Description |
|---|---|
| Event Builder | Create events with type, dates, venue, capacity, tags |
| Module Selector | Toggle modules per event (registration, teams, voting, schedule, etc.) |
| Theme Chooser | Pick a preset or customize colors/fonts — instant preview |
| Lifecycle Manager | Move events through Draft → Published → Ongoing → Archived |
| Registration Panel | View/manage all registrations with status |
| Announcements | Post updates with priority levels |

### Layer 3: Platform / Admin
| Feature | Description |
|---|---|
| Analytics Dashboard | Total users, events, registrations, events by type/status |
| Module Registry | View all platform modules and their usage across events |
| Sustainability View | Archived events, retained data, department breakdown |
| User Management | View all platform users across roles |

---

## 4. Data Models

### Users
```
id, email, name, role (student|organizer|admin), department, year,
interests[], engagement_score, created_at
```

### Events
```
id, title, slug, description, event_type, status (draft|published|ongoing|archived),
organizer_id, department, start_date, end_date, venue, max_participants, tags[],
theme_config{}, enabled_modules[], module_configs{}, created_at
```

### Registrations
```
id, event_id, user_id, status (registered|waitlisted|cancelled|attended),
team_id, registered_at, checked_in_at
```

### Participation Log (Sustainability)
```
id, user_id, event_id, academic_year, event_type, role, points_earned,
certificate_issued
```

### Module Registry
```
id, name, description, icon, default_enabled, config_schema{}, sort_order
```

Additional: teams, team_members, event_roles, announcements, schedule_items, vote_polls, votes

---

## 5. API Design

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List events (filter: status, type, department, tag, search) |
| GET | `/api/events/:slug` | Full event detail + module data (microsite payload) |
| POST | `/api/events` | Create event (organizer/admin) |
| PATCH | `/api/events/:slug` | Update event (status, modules, theme, etc.) |
| POST | `/api/events/:slug/register` | Student registers |
| DELETE | `/api/events/:slug/register` | Cancel registration |
| GET | `/api/events/:slug/registrations` | List registrations (organizer) |
| POST | `/api/events/:slug/announcements` | Post announcement |
| POST | `/api/events/:slug/schedule` | Add schedule item |
| GET | `/api/platform/modules` | List all platform modules |
| GET | `/api/platform/themes` | List theme presets |
| GET | `/api/platform/stats` | Platform analytics |
| GET | `/api/platform/recommendations/:userId` | AI-assisted recommendations |
| GET | `/api/users/:id/registrations` | User's registrations |
| GET | `/api/users/:id/participation` | Participation history |

---

## 6. Theme & Module System

### Theme Configuration (JSON)
Each event stores a `theme_config` object. Example:

```json
{
  "name": "Hackathon Neon",
  "colors": {
    "primary": "#00ff88",
    "secondary": "#00ccff",
    "accent": "#ff00ff",
    "background": "#0a0a0a",
    "surface": "#1a1a2e",
    "text": "#e0e0e0",
    "textSecondary": "#888888",
    "border": "#333333"
  },
  "fonts": {
    "heading": "'JetBrains Mono', monospace",
    "body": "'Inter', sans-serif"
  },
  "layout": "tech",
  "borderRadius": "4px"
}
```

**How it works:**
1. Event stores theme config as JSON in the database
2. API returns `theme_config` when fetching event detail
3. Frontend injects values as CSS custom properties (`--theme-primary`, etc.)
4. Microsite components bind to these properties
5. Result: Same React components, completely different visual identity

### Available Theme Presets
| Preset | Use Case | Vibe |
|---|---|---|
| Campus Default | General events | Clean blue/purple |
| Hackathon Neon | Hackathons, tech | Dark mode, neon greens |
| Cultural Fest | Cultural events | Warm reds/oranges, serif fonts |
| Sports Arena | Sports tournaments | Bold red/blue, strong fonts |
| Workshop Minimal | Workshops, seminars | Indigo/violet, clean sans-serif |

### Dynamic Module System

**Registry:** All modules are registered in the `module_registry` table with:
- `id`: Unique identifier (e.g., "registration", "teams", "voting")
- `config_schema`: JSON schema defining configurable options
- `default_enabled`: Whether new events get this module by default

**Per-event activation:**
- `enabled_modules[]`: Array of active module IDs for this event
- `module_configs{}`: Per-module configuration (e.g., max team size)

**Frontend rendering:**
```
MODULE_COMPONENTS = {
  schedule: ScheduleModule,
  announcements: AnnouncementsModule,
  teams: TeamsModule,
  voting: VotingModule,
  checkin: CheckInModule,
  leaderboard: LeaderboardModule
}

// Render only enabled modules:
event.enabled_modules.map(id => {
  const Component = MODULE_COMPONENTS[id];
  return <Component data={event.modules[id]} theme={event.theme_config} />;
})
```

**Adding a new module:**
1. Add entry to `module_registry`
2. Create API endpoint for module data
3. Create React component
4. Register in `MODULE_COMPONENTS` map

No existing code changes required. Pure extension.

---

## 7. AI Integration

AI is used **assistively**, not as a core dependency.

| Feature | How AI Helps | Implementation |
|---|---|---|
| Event Recommendations | Match student interests with event tags | Tag-matching algorithm with relevance scoring |
| Auto-tagging | Suggest tags based on event description | (Future: Gemini API call on event creation) |
| Event Summaries | Generate concise summaries | (Future: Gemini API summarization) |

**What we DO NOT claim:**
- AI does not "decide" what events to show
- AI does not "perfectly predict" interests
- AI does not replace human organizers

**What we DO say:**
- "AI assists discovery by matching interests to event tags"
- "Recommendation relevance scores are transparent and explainable"

---

## 8. Sustainability & Continuity

This is the differentiator judges will remember.

### Problem
- Graduating students take institutional knowledge with them
- Every new batch rebuilds event systems from scratch
- No historical data on what worked, who participated, what was popular

### Solution
| Aspect | How Campus Flow Handles It |
|---|---|
| Data Persistence | All events are archived, not deleted. Full participation logs retained. |
| Configuration Reuse | Archived event configs can be cloned for next year |
| Engagement History | Student engagement scores and participation carry forward across years |
| No Rebuilding | New organizers get the same platform — just create new events |
| Self-Documenting | Module registry, theme presets, and event configs serve as documentation |
| Zero Handover Friction | New batch logs in → sees all past events → creates new ones using existing templates |

### Academic Year Tracking
The `participation_log` table explicitly tracks `academic_year`, enabling:
- Year-over-year participation trends
- Historical engagement analysis
- Certificate/credential continuity

---

## 9. Demo Script (2 Minutes)

### Setup (Before Demo)
- Run `npm run seed` to populate demo data
- Run `npm run dev` to start both servers
- Open http://localhost:3000

### Demo Flow

**[0:00 - 0:20] The Problem**
> "Every year, campus events run on WhatsApp, Instagram, and Google Forms.
> Each new fest rebuilds everything from scratch. Campus Flow fixes this."

**[0:20 - 0:40] Student View**
- Switch to **Ananya Verma (student)** in sidebar
- Show **Dashboard**: registered events, engagement score, AI recommendations
- Click **Discover Events**: show filters (type, status), event cards with fill rates
- Click into **HackCampus 2026**: show themed microsite with schedule, announcements
- Click **Register**: one-click registration

**[0:40 - 1:10] Organizer View**
- Switch to **Priya Sharma (organizer)**
- Show **My Events**: table with all events, statuses, registration counts
- Click **Create Event**: fill title "Design Sprint 2026"
  - Toggle modules: enable Teams, Voting, disable Leaderboard
  - Pick **Cultural Fest** theme preset — show live preview
  - Create event (saves as Draft)
- Go to **Manage Event**: change status to Published
  - Show module toggles changing the microsite in real-time
  - Post an announcement

**[1:10 - 1:30] Platform Differentiator**
- Switch to **Platform Admin**
- Show **Admin Console**: total users, events, registrations
- Show **Module Registry**: 7 modules with usage stats
- Show **Sustainability View**: archived events, retained data, department breakdown
- Highlight: "Next year's batch inherits everything. Zero rebuild."

**[1:30 - 1:50] Theme-Agnostic Demo**
- Go back to **Manage Event** for HackCampus
- Switch theme from **Hackathon Neon** to **Cultural Fest**
- Open microsite: "Same event, completely different identity. Same backend. Different skin."
- Switch back to Hackathon Neon

**[1:50 - 2:00] Close**
> "Campus Flow: One platform. Any event. Any theme. Any year.
> This could realistically replace how our university runs events."

---

## 10. Judge Q&A Cheat Sheet

### "Is this just a CMS?"
> No. A CMS manages content — pages, posts, media. Campus Flow manages
> **participation**. Events have lifecycle states (Draft→Published→Ongoing→Archived),
> built-in registration with waitlists, team formation, live voting, and QR check-in.
> The module system is plug-and-play per event, not site-wide plugins. Each event
> generates its own themed microsite from configuration. This is infrastructure,
> not a content manager.

### "Why the retro CRT aesthetic?"
> The retro aesthetic is the **platform shell** — the institutional layer that admins
> and organizers work in. It conveys a "command center" feel: monitoring events,
> toggling modules, managing infrastructure. But critically, this retro style
> **never touches the student-facing microsites**. Each event gets its own visual
> identity from its theme config. The retro shell is our platform branding.
> Event branding is configurable.

### "Where is AI used?"
> AI assists discovery, not decision-making. We use interest-to-tag matching to
> recommend events to students, with transparent relevance scores. Future scope
> includes auto-tagging events from descriptions and generating event summaries
> via Gemini API. We don't claim AI "decides" anything — it's an assistive layer.

### "Why is this sustainable?"
> Three reasons:
> 1. **Data persists**: Events are archived, not deleted. Participation logs track
>    academic years explicitly.
> 2. **No rebuild needed**: New organizers use the same platform, same module library,
>    same theme presets. They just create new events.
> 3. **Self-documenting**: The module registry, theme configs, and event archives
>    serve as living documentation. Zero handover friction.

### "How is this different from just building a website for each event?"
> A dedicated website dies after the event. Campus Flow:
> - Retains all data for analytics and continuity
> - Reuses modules and themes across events
> - Gives students a single source of truth
> - Eliminates per-event development cost
> - Scales from a small workshop to a 3-day fest using the same infrastructure

### "Can new modules be added?"
> Yes. The module system is designed as a registry. To add a new module:
> 1. Add an entry to the module registry (name, description, config schema)
> 2. Create the backend endpoint / table
> 3. Create the frontend component
> 4. Register it in the component map
> No existing code changes required. It's pure extension, not modification.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev, hot reload, clean component model |
| Backend | Node.js + Express | Simple, well-understood, fast to build |
| Database | SQLite (better-sqlite3) | Zero-config, portable, single-file DB |
| Icons | Lucide React | Clean, consistent iconography |
| Styling | Custom CSS (no framework) | Full control for retro aesthetic + theme injection |

---

## Project Structure

```
CAMPUS-FLOW/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main shell with sidebar, routing
│   │   ├── api.js           # API client layer
│   │   ├── index.css        # CRT retro base styles + theme injection system
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # User switching (demo auth)
│   │   └── pages/
│   │       ├── StudentDashboard.jsx   # Layer 1: student command center
│   │       ├── EventDiscovery.jsx     # Layer 1: search/filter events
│   │       ├── EventMicrosite.jsx     # Layer 1: themed event page + dynamic modules
│   │       ├── MyHistory.jsx          # Layer 1: participation history
│   │       ├── OrganizerDashboard.jsx # Layer 2: event management
│   │       ├── CreateEvent.jsx        # Layer 2: event builder + module/theme config
│   │       ├── ManageEvent.jsx        # Layer 2: lifecycle, modules, registrations
│   │       └── AdminDashboard.jsx     # Layer 3: platform analytics
│   └── index.html
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.js         # Express server entry
│   │   ├── middleware/
│   │   │   └── auth.js      # Role-based auth (header-based for demo)
│   │   ├── models/
│   │   │   └── database.js  # SQLite schema + connection
│   │   ├── config/
│   │   │   ├── modules.js   # Platform module definitions
│   │   │   └── themes.js    # Theme preset definitions
│   │   ├── routes/
│   │   │   ├── events.js    # Event CRUD + registration + modules
│   │   │   ├── users.js     # User profiles + history
│   │   │   └── platform.js  # Modules, themes, stats, recommendations
│   │   └── seeds/
│   │       └── seed.js      # Demo data seeder
│   └── campus_flow.db       # SQLite database (auto-created)
└── package.json             # Monorepo root
```

---

## Future Scope (Not built, but architecturally supported)

- Gemini API integration for auto-tagging and event summaries
- Certificate generation from participation log
- Real-time WebSocket updates for live voting
- Mobile PWA wrapper
- SSO integration with university auth systems
- Event cloning from archived events
- Custom module development SDK

---

*Built for hackathon by Team Campus Flow*

import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Monitor, Calendar, Users, LayoutDashboard, Settings, Archive, PlusCircle, Zap, BarChart3 } from 'lucide-react';
import StudentDashboard from './pages/StudentDashboard';
import EventDiscovery from './pages/EventDiscovery';
import EventMicrosite from './pages/EventMicrosite';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import ManageEvent from './pages/ManageEvent';
import AdminDashboard from './pages/AdminDashboard';
import MyHistory from './pages/MyHistory';

export default function App() {
  const { users, currentUser, switchUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', color: 'var(--shell-glow)', fontSize: '0.7rem', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}>
          CAMPUS FLOW
        </div>
        <div style={{ color: 'var(--shell-text-dim)', fontSize: '0.8rem' }}>Initializing system...</div>
      </div>
    );
  }

  const pageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'DASHBOARD';
    if (path === '/events') return 'EVENT DISCOVERY';
    if (path.startsWith('/event/')) return 'EVENT MICROSITE';
    if (path === '/organizer') return 'ORGANIZER CONSOLE';
    if (path === '/organizer/create') return 'CREATE EVENT';
    if (path.startsWith('/organizer/manage/')) return 'MANAGE EVENT';
    if (path === '/admin') return 'PLATFORM ADMIN';
    if (path === '/history') return 'PARTICIPATION HISTORY';
    return 'CAMPUS FLOW';
  };

  return (
    <>
      <div className="crt-overlay" />
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>CAMPUS<br />FLOW</h1>
            <div className="subtitle">Campus as a Platform</div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">Student</div>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              <Monitor size={16} /> Dashboard
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Calendar size={16} /> Discover Events
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Archive size={16} /> My History
            </NavLink>

            {currentUser && ['organizer', 'admin'].includes(currentUser.role) && (
              <>
                <div className="nav-section" style={{ marginTop: 16 }}>Organizer</div>
                <NavLink to="/organizer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                  <LayoutDashboard size={16} /> My Events
                </NavLink>
                <NavLink to="/organizer/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <PlusCircle size={16} /> Create Event
                </NavLink>
              </>
            )}

            {currentUser && currentUser.role === 'admin' && (
              <>
                <div className="nav-section" style={{ marginTop: 16 }}>Platform</div>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <BarChart3 size={16} /> Admin Console
                </NavLink>
              </>
            )}
          </nav>

          {/* User switcher for demo */}
          <div className="sidebar-user">
            <select value={currentUser?.id || ''} onChange={e => switchUser(e.target.value)}>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            {currentUser && (
              <span className={`role-badge role-${currentUser.role}`}>
                {currentUser.role}
              </span>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div className="topbar">
            <div className="topbar-title">
              <Zap size={14} style={{ color: 'var(--shell-glow)' }} />
              {pageTitle()}
              <span className="blinker" />
            </div>
            <div className="topbar-status">
              <span className="status-indicator">
                <span className="status-dot" />
                SYS ONLINE
              </span>
              <span>{currentUser?.name}</span>
            </div>
          </div>

          <div className="page-content page-enter">
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/events" element={<EventDiscovery />} />
              <Route path="/event/:slug" element={<EventMicrosite />} />
              <Route path="/history" element={<MyHistory />} />
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/organizer/create" element={<CreateEvent />} />
              <Route path="/organizer/manage/:slug" element={<ManageEvent />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

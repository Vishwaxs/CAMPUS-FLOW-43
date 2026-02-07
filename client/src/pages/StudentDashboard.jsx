import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, getUserRegistrations, getRecommendations } from '../api';
import { Calendar, MapPin, Users, ArrowRight, Star, Zap } from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getUserRegistrations(currentUser.id),
      getRecommendations(currentUser.id)
    ]).then(([regs, recs]) => {
      setMyRegistrations(regs);
      setRecommended(recs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div className="text-dim">Loading dashboard...</div>;

  const activeRegs = myRegistrations.filter(r => r.status !== 'cancelled' && r.event_status !== 'archived');
  const upcomingEvents = activeRegs.filter(r => r.event_status === 'published' || r.event_status === 'ongoing');

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-4">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--shell-text-bright)', marginBottom: 4 }}>
          Welcome back, {currentUser?.name?.split(' ')[0]}
        </h2>
        <p className="text-dim text-sm">Your campus event command center</p>
      </div>

      {/* Stats row */}
      <div className="grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-value">{activeRegs.length}</div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-amber)' }}>{upcomingEvents.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-cyan)' }}>{currentUser?.engagement_score || 0}</div>
          <div className="stat-label">Eng. Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-amber)' }}>
            {myRegistrations.filter(r => r.status === 'attended').length}
          </div>
          <div className="stat-label">Attended</div>
        </div>
      </div>

      {/* My upcoming events */}
      <div className="panel mb-4">
        <div className="panel-header">
          <span className="panel-title">My Upcoming Events</span>
          <Link to="/events" className="btn btn-sm btn-ghost">Browse All <ArrowRight size={12} /></Link>
        </div>
        <div className="panel-body">
          {upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} style={{ opacity: 0.3 }} />
              <p className="mt-2 text-sm">No upcoming events. <Link to="/events" className="text-glow">Discover events</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.map(reg => (
                <Link to={`/event/${reg.event_slug}`} key={reg.id} className="event-card" style={{ textDecoration: 'none' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="event-title">{reg.event_title}</div>
                      <div className="event-meta">
                        <span><Calendar size={12} /> {new Date(reg.start_date).toLocaleDateString()}</span>
                        <span className={`status-badge status-${reg.event_status}`}>{reg.event_status}</span>
                        <span className={`tag tag-${reg.status === 'registered' ? 'green' : 'amber'}`}>{reg.status}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--shell-text-dim)' }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><Zap size={12} style={{ display: 'inline', marginRight: 4 }} />Recommended For You</span>
          <span className="text-xs text-dim">Based on your interests</span>
        </div>
        <div className="panel-body">
          {recommended.length === 0 ? (
            <div className="empty-state text-sm">No recommendations right now.</div>
          ) : (
            <div className="grid-2">
              {recommended.slice(0, 4).map(event => (
                <Link to={`/event/${event.slug}`} key={event.id} className="event-card" style={{ textDecoration: 'none' }}>
                  <div className="event-title">{event.title}</div>
                  <div className="event-desc">{event.short_description}</div>
                  <div className="event-meta">
                    <span><Calendar size={12} /> {new Date(event.start_date).toLocaleDateString()}</span>
                    <span><Users size={12} /> {event.registration_count}/{event.max_participants}</span>
                    {event.relevance_score > 0 && (
                      <span className="tag tag-green"><Star size={10} /> {Math.round(event.relevance_score * 100)}% match</span>
                    )}
                  </div>
                  <div className="event-tags">
                    {event.tags.slice(0, 3).map(t => <span key={t} className="tag tag-cyan">{t}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

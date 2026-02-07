import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../api';
import { Calendar, Settings, Users, Eye, PlusCircle } from 'lucide-react';

export default function OrganizerDashboard() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(data => {
      // Show events organized by current user, or all if admin
      const filtered = currentUser?.role === 'admin'
        ? data
        : data.filter(e => e.organizer_id === currentUser?.id);
      setEvents(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div className="text-dim">Loading organizer console...</div>;

  const grouped = {
    draft: events.filter(e => e.status === 'draft'),
    published: events.filter(e => e.status === 'published'),
    ongoing: events.filter(e => e.status === 'ongoing'),
    archived: events.filter(e => e.status === 'archived')
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--shell-text-bright)' }}>My Events</h2>
          <p className="text-dim text-sm">Manage and monitor your campus events</p>
        </div>
        <Link to="/organizer/create" className="btn btn-primary">
          <PlusCircle size={14} /> New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-glow)' }}>{grouped.published.length + grouped.ongoing.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-amber)' }}>{grouped.draft.length}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-cyan)' }}>{grouped.archived.length}</div>
          <div className="stat-label">Archived</div>
        </div>
      </div>

      {/* Events table */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Event Inventory</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {events.length === 0 ? (
            <div className="empty-state">
              <p className="text-sm text-dim">No events yet. <Link to="/organizer/create" className="text-glow">Create your first event</Link></p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Registrations</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 500, color: 'var(--shell-text-bright)' }}>{event.title}</td>
                    <td><span className="tag tag-amber">{event.event_type}</span></td>
                    <td><span className={`status-badge status-${event.status}`}>{event.status}</span></td>
                    <td>{event.registration_count}/{event.max_participants}</td>
                    <td className="text-dim">{event.start_date ? new Date(event.start_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/event/${event.slug}`} className="btn btn-sm btn-ghost"><Eye size={12} /> View</Link>
                        <Link to={`/organizer/manage/${event.slug}`} className="btn btn-sm btn-secondary"><Settings size={12} /> Manage</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

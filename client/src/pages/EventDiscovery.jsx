import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';

const EVENT_TYPES = ['all', 'fest', 'workshop', 'hackathon', 'seminar', 'competition', 'cultural', 'sports', 'general'];
const STATUSES = ['all', 'published', 'ongoing', 'archived'];

export default function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const params = {};
    if (typeFilter !== 'all') params.type = typeFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search) params.search = search;

    getEvents(params).then(data => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [typeFilter, statusFilter, search]);

  return (
    <div>
      {/* Filters bar */}
      <div className="panel mb-4">
        <div className="panel-body">
          <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shell-text-dim)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 30 }}
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-dim">Scanning event database...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Filter size={32} style={{ opacity: 0.3 }} />
          <p className="mt-2">No events match your filters.</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-dim mb-3">{events.length} event(s) found</div>
          <div className="grid-2">
            {events.map(event => (
              <Link to={`/event/${event.slug}`} key={event.id} className="event-card" style={{ textDecoration: 'none' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`status-badge status-${event.status}`}>{event.status}</span>
                  <span className="tag tag-amber">{event.event_type}</span>
                </div>
                <div className="event-title">{event.title}</div>
                <div className="event-desc">{event.short_description}</div>
                <div className="event-meta">
                  {event.start_date && <span><Calendar size={12} /> {new Date(event.start_date).toLocaleDateString()}</span>}
                  {event.venue && <span><MapPin size={12} /> {event.venue}</span>}
                  <span><Users size={12} /> {event.registration_count}/{event.max_participants}</span>
                </div>
                {event.registration_count > 0 && (
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (event.registration_count / event.max_participants) * 100)}%` }} />
                    </div>
                  </div>
                )}
                <div className="event-tags">
                  {event.tags.slice(0, 4).map(t => <span key={t} className="tag tag-cyan">{t}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

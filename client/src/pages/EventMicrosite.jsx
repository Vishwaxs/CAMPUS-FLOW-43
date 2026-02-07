import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvent, registerForEvent, cancelRegistration, getUserRegistrations } from '../api';
import { Calendar, MapPin, Users, Clock, Megaphone, Trophy, Vote, QrCode, UserPlus, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';

// Dynamic module components — rendered conditionally based on event config
function ScheduleModule({ data, theme }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={16} /> Schedule
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(item => (
          <div key={item.id} style={{
            display: 'flex', gap: 12, padding: 12,
            borderLeft: `3px solid ${theme?.colors?.primary || '#2563eb'}`,
            background: theme?.colors?.surface || '#f8fafc',
            borderRadius: theme?.borderRadius || '8px'
          }}>
            <div style={{ minWidth: 80, fontSize: '0.75rem', color: theme?.colors?.textSecondary || '#64748b' }}>
              {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {item.end_time && <><br />{new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              {item.description && <div style={{ fontSize: '0.85rem', color: theme?.colors?.textSecondary || '#64748b', marginTop: 2 }}>{item.description}</div>}
              {item.venue && <div style={{ fontSize: '0.75rem', marginTop: 4 }}><MapPin size={10} /> {item.venue}</div>}
              {item.speaker && <div style={{ fontSize: '0.75rem', marginTop: 2 }}>{item.speaker}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsModule({ data, theme }) {
  if (!data || data.length === 0) return null;
  const priorityColors = { urgent: '#ef4444', high: '#f59e0b', normal: theme?.colors?.primary || '#2563eb', low: '#94a3b8' };
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Megaphone size={16} /> Announcements
      </h3>
      {data.map(a => (
        <div key={a.id} style={{
          padding: 12, marginBottom: 8,
          borderLeft: `3px solid ${priorityColors[a.priority]}`,
          background: theme?.colors?.surface || '#f8fafc',
          borderRadius: theme?.borderRadius || '8px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
          <div style={{ fontSize: '0.85rem', color: theme?.colors?.textSecondary || '#64748b', marginTop: 4 }}>{a.body}</div>
          <div style={{ fontSize: '0.7rem', color: theme?.colors?.textSecondary || '#94a3b8', marginTop: 6 }}>
            {new Date(a.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamsModule({ data, theme }) {
  if (!data || data.length === 0) return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={16} /> Teams
      </h3>
      <p style={{ color: theme?.colors?.textSecondary || '#64748b', fontSize: '0.85rem' }}>No teams formed yet. Be the first to create one!</p>
    </div>
  );
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={16} /> Teams ({data.length})
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {data.map(team => (
          <div key={team.id} style={{
            padding: 10, background: theme?.colors?.surface || '#f8fafc',
            border: `1px solid ${theme?.colors?.border || '#e2e8f0'}`,
            borderRadius: theme?.borderRadius || '8px'
          }}>
            <div style={{ fontWeight: 600 }}>{team.name}</div>
            <div style={{ fontSize: '0.75rem', color: theme?.colors?.textSecondary || '#64748b' }}>
              Led by {team.leader_name} | {team.member_count} members
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VotingModule({ data, theme }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Vote size={16} /> Live Voting
      </h3>
      {data.filter(p => p.is_active).map(poll => {
        const totalVotes = poll.vote_counts.reduce((s, v) => s + v.count, 0);
        return (
          <div key={poll.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{poll.question}</div>
            {poll.options.map((opt, idx) => {
              const count = poll.vote_counts.find(v => v.option_index === idx)?.count || 0;
              const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <div key={idx} style={{ marginBottom: 6 }}>
                  <div className="flex justify-between text-sm" style={{ marginBottom: 2 }}>
                    <span>{opt}</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: theme?.colors?.border || '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: theme?.colors?.primary || '#2563eb', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: '0.7rem', color: theme?.colors?.textSecondary || '#64748b', marginTop: 4 }}>{totalVotes} total votes</div>
          </div>
        );
      })}
    </div>
  );
}

function CheckInModule({ theme }) {
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <QrCode size={16} /> QR Check-In
      </h3>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{
          width: 140, height: 140, margin: '0 auto', background: theme?.colors?.surface || '#f0f0f0',
          border: `2px solid ${theme?.colors?.primary || '#2563eb'}`, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', color: theme?.colors?.textSecondary || '#64748b'
        }}>
          <div>
            <QrCode size={48} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>QR Placeholder</div>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: theme?.colors?.textSecondary || '#64748b', marginTop: 8 }}>
          Show this code at the venue for check-in
        </p>
      </div>
    </div>
  );
}

function LeaderboardModule({ data, theme }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy size={16} /> Leaderboard
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme?.colors?.border || '#e2e8f0'}` }}>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: '0.7rem', textTransform: 'uppercase', color: theme?.colors?.textSecondary || '#64748b' }}>#</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: '0.7rem', textTransform: 'uppercase', color: theme?.colors?.textSecondary || '#64748b' }}>Team</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: '0.7rem', textTransform: 'uppercase', color: theme?.colors?.textSecondary || '#64748b' }}>Members</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, i) => (
            <tr key={team.id} style={{ borderBottom: `1px solid ${theme?.colors?.border || '#e2e8f020'}` }}>
              <td style={{ padding: '6px 10px', fontWeight: i < 3 ? 700 : 400 }}>{i + 1}</td>
              <td style={{ padding: '6px 10px' }}>{team.name}</td>
              <td style={{ padding: '6px 10px' }}>{team.member_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Module registry — maps module IDs to components
const MODULE_COMPONENTS = {
  schedule: ScheduleModule,
  announcements: AnnouncementsModule,
  teams: TeamsModule,
  voting: VotingModule,
  checkin: CheckInModule,
  leaderboard: LeaderboardModule
};

export default function EventMicrosite() {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getEvent(slug).then(data => {
      setEvent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  // Check if current user is registered
  useEffect(() => {
    if (!event || !currentUser) return;
    getUserRegistrations(currentUser.id).then(regs => {
      const myReg = regs.find(r => r.event_slug === slug && r.status !== 'cancelled');
      setRegStatus(myReg ? myReg.status : null);
    });
  }, [event, currentUser, slug]);

  const handleRegister = async () => {
    setRegLoading(true);
    setError('');
    try {
      const result = await registerForEvent(slug);
      setRegStatus(result.status);
    } catch (e) {
      setError(e.message);
    }
    setRegLoading(false);
  };

  const handleCancel = async () => {
    setRegLoading(true);
    try {
      await cancelRegistration(slug);
      setRegStatus(null);
    } catch (e) {
      setError(e.message);
    }
    setRegLoading(false);
  };

  if (loading) return <div className="text-dim">Loading event data...</div>;
  if (!event) return <div className="text-dim">Event not found.</div>;

  const theme = event.theme_config || {};
  const colors = theme.colors || {};

  // Build CSS custom properties for theme injection
  const themeStyle = {
    '--theme-primary': colors.primary,
    '--theme-secondary': colors.secondary,
    '--theme-accent': colors.accent,
    '--theme-background': colors.background,
    '--theme-surface': colors.surface,
    '--theme-text': colors.text,
    '--theme-text-secondary': colors.textSecondary,
    '--theme-border': colors.border,
    '--theme-radius': theme.borderRadius,
    '--theme-font-heading': theme.fonts?.heading,
    '--theme-font-body': theme.fonts?.body,
  };

  const regCount = event.modules?.registration?.count || 0;
  const regMax = event.modules?.registration?.max || event.max_participants;

  return (
    <div className="themed-microsite" style={themeStyle}>
      {/* Event Hero */}
      <div style={{
        padding: '32px 24px',
        background: `linear-gradient(135deg, ${colors.primary || '#2563eb'}15, ${colors.secondary || '#7c3aed'}15)`,
        borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
        borderRadius: `${theme.borderRadius || '8px'} ${theme.borderRadius || '8px'} 0 0`
      }}>
        <div className="flex justify-between items-center mb-2" style={{ flexWrap: 'wrap', gap: 8 }}>
          <span className="ms-badge">{event.event_type}</span>
          <span className={`status-badge status-${event.status}`}>{event.status}</span>
        </div>
        <h1 className="ms-heading" style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: theme.fonts?.heading || 'Inter, sans-serif'
        }}>
          {event.title}
        </h1>
        <p style={{ fontSize: '1rem', color: colors.textSecondary || '#64748b', maxWidth: 600 }}>
          {event.short_description}
        </p>

        {/* Key info */}
        <div className="flex gap-4 mt-3" style={{ flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {event.start_date && (
            <span className="flex items-center gap-2">
              <Calendar size={14} /> {new Date(event.start_date).toLocaleDateString()} — {event.end_date ? new Date(event.end_date).toLocaleDateString() : 'TBD'}
            </span>
          )}
          {event.venue && <span className="flex items-center gap-2"><MapPin size={14} /> {event.venue}</span>}
          <span className="flex items-center gap-2"><Users size={14} /> {regCount}/{regMax} registered</span>
        </div>

        {/* Registration CTA */}
        {event.enabled_modules.includes('registration') && event.status !== 'archived' && (
          <div className="mt-3">
            {regStatus ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2" style={{ color: colors.success || '#22c55e', fontWeight: 600 }}>
                  <CheckCircle size={16} /> {regStatus === 'waitlisted' ? 'Waitlisted' : 'Registered'}
                </span>
                <button onClick={handleCancel} disabled={regLoading} className="ms-btn-primary" style={{ background: colors.error || '#ef4444', fontSize: '0.8rem', padding: '6px 14px' }}>
                  {regLoading ? 'Processing...' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={regLoading} className="ms-btn-primary" style={{ background: colors.primary || '#2563eb' }}>
                <UserPlus size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                {regLoading ? 'Processing...' : 'Register Now'}
              </button>
            )}
            {error && <div className="mt-2" style={{ color: colors.error || '#ef4444', fontSize: '0.85rem' }}><AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />{error}</div>}
          </div>
        )}
      </div>

      {/* Event body — dynamic modules render here */}
      <div style={{ padding: 24 }}>
        {/* Description */}
        <div className="ms-card" style={{ marginBottom: 16 }}>
          <h3 className="ms-heading" style={{ fontSize: '1rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} /> About This Event
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: colors.textSecondary || '#64748b' }}>
            {event.description}
          </p>
        </div>

        {/* Enabled modules */}
        <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
          {event.enabled_modules.map(m => (
            <span key={m} className="ms-badge" style={{ background: colors.secondary || '#7c3aed', fontSize: '0.65rem' }}>
              {m}
            </span>
          ))}
        </div>

        {/* Render each enabled module dynamically */}
        {event.enabled_modules.map(moduleId => {
          if (moduleId === 'registration') return null; // Already handled in hero
          const Component = MODULE_COMPONENTS[moduleId];
          if (!Component) return null;
          return <Component key={moduleId} data={event.modules?.[moduleId]} theme={theme} />;
        })}

        {/* Organizer info */}
        <div className="ms-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: colors.textSecondary || '#64748b', marginBottom: 6 }}>
            Organized by
          </div>
          <div style={{ fontWeight: 600 }}>{event.organizer_name}</div>
          {event.department && <div style={{ fontSize: '0.85rem', color: colors.textSecondary || '#64748b' }}>{event.department}</div>}
          {event.roles && event.roles.length > 0 && (
            <div className="mt-2" style={{ fontSize: '0.8rem' }}>
              {event.roles.map(r => (
                <span key={r.id} style={{ marginRight: 12 }}>{r.user_name} — <em>{r.role}</em></span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-3 flex gap-2" style={{ flexWrap: 'wrap' }}>
          {event.tags.map(t => (
            <span key={t} style={{
              padding: '3px 10px', fontSize: '0.75rem',
              border: `1px solid ${colors.border || '#e2e8f0'}`,
              borderRadius: theme.borderRadius || '8px',
              color: colors.textSecondary || '#64748b'
            }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

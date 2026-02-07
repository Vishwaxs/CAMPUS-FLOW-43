import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserRegistrations, getUserParticipation } from '../api';
import { Archive, Calendar, Award, TrendingUp } from 'lucide-react';

export default function MyHistory() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('registrations');

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getUserRegistrations(currentUser.id),
      getUserParticipation(currentUser.id)
    ]).then(([regs, parts]) => {
      setRegistrations(regs);
      setParticipation(parts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div className="text-dim">Loading participation history...</div>;

  const totalPoints = participation.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const years = [...new Set(participation.map(p => p.academic_year))];

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', color: 'var(--shell-text-bright)', marginBottom: 4 }}>Participation History</h2>
      <p className="text-dim text-sm mb-4">Your complete campus activity record — persists year over year.</p>

      <div className="grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-value">{registrations.length}</div>
          <div className="stat-label">Events Joined</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-amber)' }}>{registrations.filter(r => r.status === 'attended').length}</div>
          <div className="stat-label">Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-cyan)' }}>{totalPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-glow)' }}>{currentUser?.engagement_score || 0}</div>
          <div className="stat-label">Eng. Score</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'registrations' ? 'active' : ''}`} onClick={() => setTab('registrations')}>Current Registrations</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Year-over-Year History</button>
      </div>

      {tab === 'registrations' && (
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />My Registrations</span></div>
          <div className="panel-body" style={{ padding: 0 }}>
            {registrations.length === 0 ? (
              <div className="empty-state text-sm text-dim">No registrations yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Event Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--shell-text-bright)', fontWeight: 500 }}>{r.event_title}</td>
                      <td><span className="tag tag-amber">{r.event_type}</span></td>
                      <td><span className={`tag tag-${r.status === 'registered' ? 'green' : r.status === 'attended' ? 'cyan' : 'red'}`}>{r.status}</span></td>
                      <td><span className={`status-badge status-${r.event_status}`}>{r.event_status}</span></td>
                      <td className="text-dim">{new Date(r.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {years.length === 0 ? (
            <div className="panel"><div className="panel-body empty-state text-sm text-dim">No historical data yet. This grows as you participate across academic years.</div></div>
          ) : (
            years.map(year => (
              <div key={year} className="panel mb-3">
                <div className="panel-header">
                  <span className="panel-title"><Archive size={12} style={{ display: 'inline', marginRight: 6 }} />Academic Year {year}</span>
                  <span className="tag tag-cyan">{participation.filter(p => p.academic_year === year).length} activities</span>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Role</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participation.filter(p => p.academic_year === year).map(p => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--shell-text-bright)' }}>{p.event_title}</td>
                          <td><span className="tag tag-amber">{p.event_type}</span></td>
                          <td>{p.role}</td>
                          <td className="text-glow">+{p.points_earned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

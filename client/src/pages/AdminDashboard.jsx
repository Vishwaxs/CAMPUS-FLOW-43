import { useState, useEffect } from 'react';
import { getPlatformStats, getPlatformModules, getEvents } from '../api';
import { BarChart3, Users, Calendar, Activity, Database, Puzzle, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getPlatformModules(), getEvents()]).then(([s, m, e]) => {
      setStats(s);
      setModules(m);
      setEvents(e);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-dim">Loading platform diagnostics...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', color: 'var(--shell-text-bright)', marginBottom: 4 }}>
        <Shield size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        Platform Admin Console
      </h2>
      <p className="text-dim text-sm mb-4">System-wide analytics and configuration</p>

      {/* Platform stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card glow-pulse">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-amber)' }}>{stats?.totalEvents || 0}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-glow)' }}>{stats?.activeEvents || 0}</div>
          <div className="stat-label">Active Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--shell-cyan)' }}>{stats?.totalRegistrations || 0}</div>
          <div className="stat-label">Registrations</div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        {/* Events by Type */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><BarChart3 size={12} style={{ display: 'inline', marginRight: 6 }} />Events by Type</span></div>
          <div className="panel-body">
            {stats?.eventsByType?.map(item => {
              const max = Math.max(...stats.eventsByType.map(i => i.count));
              return (
                <div key={item.event_type} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ textTransform: 'capitalize' }}>{item.event_type}</span>
                    <span className="text-glow">{item.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(item.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events by Status */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Activity size={12} style={{ display: 'inline', marginRight: 6 }} />Events by Status</span></div>
          <div className="panel-body">
            {stats?.eventsByStatus?.map(item => (
              <div key={item.status} className="flex justify-between items-center mb-2" style={{ padding: '6px 0' }}>
                <span className={`status-badge status-${item.status}`}>{item.status}</span>
                <span className="text-sm" style={{ color: 'var(--shell-text-bright)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Module Registry */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Puzzle size={12} style={{ display: 'inline', marginRight: 6 }} />Module Registry</span></div>
          <div className="panel-body">
            <p className="text-xs text-dim mb-3">Platform-wide module catalog. These are available for all organizers.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Default</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(m => {
                  const usage = events.filter(e => e.enabled_modules?.includes(m.id)).length;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ color: 'var(--shell-text-bright)', fontWeight: 500 }}>{m.name}</div>
                        <div className="text-xs text-dim">{m.description}</div>
                      </td>
                      <td>{m.default_enabled ? <span className="tag tag-green">ON</span> : <span className="tag tag-gray">OFF</span>}</td>
                      <td><span className="text-glow">{usage}</span> events</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department breakdown */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Database size={12} style={{ display: 'inline', marginRight: 6 }} />Sustainability Data</span></div>
          <div className="panel-body">
            <p className="text-xs text-dim mb-3">Year-over-year data persistence. No rebuild needed.</p>
            <div className="stat-card mb-3" style={{ background: 'var(--shell-bg)' }}>
              <div className="stat-value" style={{ fontSize: '1rem' }}>
                {events.filter(e => e.status === 'archived').length}
              </div>
              <div className="stat-label">Archived Events (Historical Data)</div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--shell-text)', lineHeight: 1.8 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot" /> All participation logs retained
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot" /> Event configs archived for reuse
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot" /> Engagement scores carry forward
              </div>
              <div className="flex items-center gap-2">
                <span className="status-dot" /> New batch inherits full history
              </div>
            </div>

            {stats?.topDepartments?.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-dim mb-2" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Top Departments</div>
                {stats.topDepartments.map(d => (
                  <div key={d.department} className="flex justify-between text-sm mb-1">
                    <span>{d.department}</span>
                    <span className="text-amber">{d.count} events</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

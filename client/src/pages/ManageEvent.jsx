import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent, updateEvent, getEventRegistrations, createAnnouncement, getPlatformModules, getThemePresets } from '../api';
import { Save, Users, Megaphone, Eye, ArrowRight, Puzzle, Palette, CheckCircle } from 'lucide-react';

export default function ManageEvent() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [modules, setModules] = useState([]);
  const [themePresets, setThemePresets] = useState({});
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState('normal');

  useEffect(() => {
    Promise.all([
      getEvent(slug),
      getEventRegistrations(slug),
      getPlatformModules(),
      getThemePresets()
    ]).then(([ev, regs, mods, presets]) => {
      setEvent(ev);
      setRegistrations(regs);
      setModules(mods);
      setThemePresets(presets);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      const updated = await updateEvent(slug, { status: newStatus });
      setEvent(prev => ({ ...prev, ...updated }));
      setMsg(`Status changed to ${newStatus}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const handleModuleToggle = async (moduleId) => {
    const current = event.enabled_modules || [];
    const next = current.includes(moduleId) ? current.filter(m => m !== moduleId) : [...current, moduleId];
    setSaving(true);
    try {
      await updateEvent(slug, { enabled_modules: next });
      setEvent(prev => ({ ...prev, enabled_modules: next }));
      setMsg('Modules updated');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const handleThemeChange = async (presetKey) => {
    const preset = themePresets[presetKey];
    if (!preset) return;
    setSaving(true);
    try {
      await updateEvent(slug, { theme_config: preset });
      setEvent(prev => ({ ...prev, theme_config: preset }));
      setMsg('Theme updated');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annBody) return;
    try {
      await createAnnouncement(slug, { title: annTitle, body: annBody, priority: annPriority });
      setAnnTitle(''); setAnnBody(''); setAnnPriority('normal');
      setMsg('Announcement posted');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
  };

  if (loading) return <div className="text-dim">Loading event management console...</div>;
  if (!event) return <div className="text-dim">Event not found.</div>;

  const activeRegs = registrations.filter(r => r.status !== 'cancelled');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--shell-text-bright)' }}>{event.title}</h2>
          <p className="text-dim text-sm">Manage event settings, modules, and participants</p>
        </div>
        <Link to={`/event/${slug}`} className="btn btn-sm btn-ghost"><Eye size={12} /> View Microsite</Link>
      </div>

      {msg && (
        <div className="panel mb-3" style={{ borderColor: 'var(--shell-glow)' }}>
          <div className="panel-body flex items-center gap-2 text-glow text-sm">
            <CheckCircle size={14} /> {msg}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'modules', 'theme', 'registrations', 'announcements'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className="grid-4 mb-4">
            <div className="stat-card"><div className="stat-value">{activeRegs.length}</div><div className="stat-label">Registered</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--shell-amber)' }}>{event.max_participants}</div><div className="stat-label">Capacity</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--shell-cyan)' }}>{event.enabled_modules.length}</div><div className="stat-label">Modules</div></div>
            <div className="stat-card"><div className="stat-value">{Math.round((activeRegs.length / event.max_participants) * 100)}%</div><div className="stat-label">Fill Rate</div></div>
          </div>

          {/* Lifecycle controls */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Event Lifecycle</span></div>
            <div className="panel-body">
              <div className="flex gap-3 items-center mb-3">
                <span className="text-sm text-dim">Current:</span>
                <span className={`status-badge status-${event.status}`}>{event.status}</span>
              </div>
              <div className="flex gap-2">
                {event.status === 'draft' && <button className="btn btn-primary" onClick={() => handleStatusChange('published')} disabled={saving}>Publish</button>}
                {event.status === 'published' && <button className="btn btn-secondary" onClick={() => handleStatusChange('ongoing')} disabled={saving}>Mark Ongoing</button>}
                {(event.status === 'published' || event.status === 'ongoing') && <button className="btn btn-ghost" onClick={() => handleStatusChange('archived')} disabled={saving}>Archive</button>}
                {event.status === 'archived' && <button className="btn btn-ghost" onClick={() => handleStatusChange('draft')} disabled={saving}>Revert to Draft</button>}
              </div>
              <div className="mt-3 text-xs text-dim">
                Lifecycle: Draft → Published → Ongoing → Archived
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {tab === 'modules' && (
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Puzzle size={12} style={{ display: 'inline', marginRight: 6 }} />Module Configuration</span></div>
          <div className="panel-body">
            <p className="text-xs text-dim mb-3">Enable or disable modules. Changes take effect immediately on the event microsite.</p>
            {modules.map(mod => (
              <div key={mod.id} className={`module-toggle ${event.enabled_modules.includes(mod.id) ? 'active' : ''}`}>
                <div className="module-toggle-info">
                  <div className="module-toggle-name">{mod.name}</div>
                  <div className="module-toggle-desc">{mod.description}</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={event.enabled_modules.includes(mod.id)} onChange={() => handleModuleToggle(mod.id)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Tab */}
      {tab === 'theme' && (
        <div className="panel">
          <div className="panel-header"><span className="panel-title"><Palette size={12} style={{ display: 'inline', marginRight: 6 }} />Theme Configuration</span></div>
          <div className="panel-body">
            <p className="text-xs text-dim mb-3">Select a theme preset for your event microsite. Same backend, different look.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {Object.entries(themePresets).map(([key, preset]) => {
                const isActive = event.theme_config?.name === preset.name;
                return (
                  <div
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    style={{
                      padding: 14,
                      border: `2px solid ${isActive ? 'var(--shell-glow)' : 'var(--shell-border)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(0,255,65,0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--shell-text-bright)' }}>{preset.name}</div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background, preset.colors.surface].map((c, i) => (
                        <div key={i} style={{ width: 24, height: 24, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--shell-text-dim)' }}>
                      Font: {preset.fonts.heading.split(',')[0].replace(/'/g, '')} | Layout: {preset.layout}
                    </div>
                    {isActive && <div className="tag tag-green mt-2" style={{ fontSize: '0.6rem' }}>ACTIVE</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {tab === 'registrations' && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Users size={12} style={{ display: 'inline', marginRight: 6 }} />Registrations ({activeRegs.length})</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {activeRegs.length === 0 ? (
              <div className="empty-state text-sm">No registrations yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegs.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--shell-text-bright)' }}>{r.user_name}</td>
                      <td>{r.user_email}</td>
                      <td>{r.user_department}</td>
                      <td><span className={`tag tag-${r.status === 'registered' ? 'green' : r.status === 'waitlisted' ? 'amber' : 'red'}`}>{r.status}</span></td>
                      <td className="text-dim">{new Date(r.registered_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Megaphone size={12} style={{ display: 'inline', marginRight: 6 }} />Post Announcement</span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleAnnouncement}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Write your announcement..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" style={{ width: 'auto' }} value={annPriority} onChange={e => setAnnPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary"><Megaphone size={14} /> Post</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

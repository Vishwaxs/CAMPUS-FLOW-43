import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent, getPlatformModules, getThemePresets, generateTheme } from '../api';
import { Palette, Puzzle, Save, Eye } from 'lucide-react';

export default function CreateEvent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [themePresets, setThemePresets] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // NEW: AI Theme Generation State (Additive Feature)
  const [aiThemeAnswers, setAiThemeAnswers] = useState({
    mood: '',
    brightness: '',
    colorFamily: '',
    fontStyle: '',
    intensity: ''
  });
  const [generatingTheme, setGeneratingTheme] = useState(false);
  const [aiThemeError, setAiThemeError] = useState('');
  // END NEW

  const [form, setForm] = useState({
    title: '',
    description: '',
    short_description: '',
    event_type: 'general',
    department: '',
    start_date: '',
    end_date: '',
    venue: '',
    max_participants: 100,
    tags: '',
    selectedTheme: 'default',
    enabled_modules: ['registration', 'schedule', 'announcements']
  });

  useEffect(() => {
    Promise.all([getPlatformModules(), getThemePresets()]).then(([mods, presets]) => {
      setModules(mods);
      setThemePresets(presets);
    });
  }, []);

  const toggleModule = (moduleId) => {
    setForm(prev => ({
      ...prev,
      enabled_modules: prev.enabled_modules.includes(moduleId)
        ? prev.enabled_modules.filter(m => m !== moduleId)
        : [...prev.enabled_modules, moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const theme_config = themePresets[form.selectedTheme] || themePresets.default || {};
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await createEvent({
        ...form,
        tags,
        theme_config,
        enabled_modules: form.enabled_modules
      });
      navigate(`/event/${result.slug}`);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  // NEW: AI Theme Generation Handler (Additive Feature)
  const handleGenerateTheme = async () => {
    setAiThemeError('');

    // Validate all 5 answers are filled
    const { mood, brightness, colorFamily, fontStyle, intensity } = aiThemeAnswers;
    if (!mood || !brightness || !colorFamily || !fontStyle || !intensity) {
      setAiThemeError('Please answer all 5 questions to generate a theme');
      return;
    }

    setGeneratingTheme(true);
    try {
      const generatedTheme = await generateTheme(aiThemeAnswers);

      // Add generated theme to themePresets as 'ai-generated'
      setThemePresets(prev => ({
        ...prev,
        'ai-generated': generatedTheme
      }));

      // Select the generated theme
      setForm(prev => ({ ...prev, selectedTheme: 'ai-generated' }));

      setAiThemeError('');
    } catch (e) {
      setAiThemeError(e.message || 'Failed to generate theme. Please try again.');
    }
    setGeneratingTheme(false);
  };
  // END NEW

  const previewTheme = themePresets[form.selectedTheme] || {};

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', color: 'var(--shell-text-bright)', marginBottom: 4 }}>Create New Event</h2>
      <p className="text-dim text-sm mb-4">Configure your event, pick modules, and choose a theme.</p>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {/* Left: Event Details */}
          <div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Event Details</span></div>
              <div className="panel-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="HackCampus 2026" />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input className="form-input" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="One-liner for cards" />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed event description..." />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select className="form-select" value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
                      {['general', 'fest', 'workshop', 'hackathon', 'seminar', 'competition', 'cultural', 'sports'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="CSE" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input className="form-input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Main Auditorium" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Participants</label>
                    <input className="form-input" type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) || 100 })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="tech, coding, ai, workshop" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Modules + Theme */}
          <div>
            {/* Module Selector */}
            <div className="panel mb-4">
              <div className="panel-header">
                <span className="panel-title"><Puzzle size={12} style={{ display: 'inline', marginRight: 6 }} />Modules</span>
                <span className="text-xs text-dim">{form.enabled_modules.length} active</span>
              </div>
              <div className="panel-body">
                <p className="text-xs text-dim mb-3">Toggle modules to customize your event's feature set.</p>
                {modules.map(mod => (
                  <div key={mod.id} className={`module-toggle ${form.enabled_modules.includes(mod.id) ? 'active' : ''}`}>
                    <div className="module-toggle-info">
                      <div className="module-toggle-name">{mod.name}</div>
                      <div className="module-toggle-desc">{mod.description}</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={form.enabled_modules.includes(mod.id)} onChange={() => toggleModule(mod.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title"><Palette size={12} style={{ display: 'inline', marginRight: 6 }} />Theme</span>
              </div>
              <div className="panel-body">
                <p className="text-xs text-dim mb-3">Pick a preset. Your event microsite will use these colors and fonts.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(themePresets).map(([key, preset]) => (
                    <div
                      key={key}
                      onClick={() => setForm({ ...form, selectedTheme: key })}
                      style={{
                        padding: 12,
                        border: `2px solid ${form.selectedTheme === key ? 'var(--shell-glow)' : 'var(--shell-border)'}`,
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        background: form.selectedTheme === key ? 'rgba(0,255,65,0.05)' : 'transparent'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: 'var(--shell-text-bright)' }}>{preset.name}</div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background].map((c, i) => (
                          <div key={i} style={{ width: 20, height: 20, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Theme preview */}
                {previewTheme.colors && (
                  <div className="mt-3" style={{
                    background: previewTheme.colors.background,
                    padding: 16,
                    borderRadius: previewTheme.borderRadius || '8px',
                    border: `1px solid ${previewTheme.colors.border}`
                  }}>
                    <div style={{ fontFamily: previewTheme.fonts?.heading, fontWeight: 700, color: previewTheme.colors.text, marginBottom: 4 }}>
                      Preview: {previewTheme.name}
                    </div>
                    <p style={{ fontFamily: previewTheme.fonts?.body, fontSize: '0.85rem', color: previewTheme.colors.textSecondary }}>
                      This is how your event page will look.
                    </p>
                    <button style={{
                      marginTop: 8, padding: '6px 14px', background: previewTheme.colors.primary,
                      color: '#fff', border: 'none', borderRadius: previewTheme.borderRadius || '8px',
                      fontFamily: previewTheme.fonts?.body, fontSize: '0.8rem', cursor: 'pointer'
                    }}>
                      Register Now
                    </button>
                  </div>
                )}

                {/* NEW: AI Theme Generation Section (Additive Feature) */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--shell-border)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--shell-text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>OR</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--shell-text-bright)' }}>Generate Custom Theme with AI</div>
                  <p className="text-xs text-dim mb-3">Answer 5 questions and let AI create a unique theme for your event.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Question 1: Event Mood */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>1. Event Mood</label>
                      <select
                        className="form-select"
                        value={aiThemeAnswers.mood}
                        onChange={e => setAiThemeAnswers({ ...aiThemeAnswers, mood: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <option value="">Select mood...</option>
                        <option value="Professional">Professional</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Festive">Festive</option>
                        <option value="Minimal">Minimal</option>
                        <option value="Futuristic">Futuristic</option>
                      </select>
                    </div>

                    {/* Question 2: Brightness */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>2. Brightness Preference</label>
                      <select
                        className="form-select"
                        value={aiThemeAnswers.brightness}
                        onChange={e => setAiThemeAnswers({ ...aiThemeAnswers, brightness: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <option value="">Select brightness...</option>
                        <option value="Light">Light</option>
                        <option value="Dark">Dark</option>
                        <option value="Auto">Auto (AI decides)</option>
                      </select>
                    </div>

                    {/* Question 3: Color Family */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>3. Primary Color Family</label>
                      <select
                        className="form-select"
                        value={aiThemeAnswers.colorFamily}
                        onChange={e => setAiThemeAnswers({ ...aiThemeAnswers, colorFamily: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <option value="">Select color...</option>
                        <option value="Blue">Blue</option>
                        <option value="Purple">Purple</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Orange">Orange</option>
                        <option value="Mixed">Mixed (AI decides)</option>
                      </select>
                    </div>

                    {/* Question 4: Font Style */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>4. Font Style</label>
                      <select
                        className="form-select"
                        value={aiThemeAnswers.fontStyle}
                        onChange={e => setAiThemeAnswers({ ...aiThemeAnswers, fontStyle: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <option value="">Select font style...</option>
                        <option value="Modern">Modern</option>
                        <option value="Elegant">Elegant</option>
                        <option value="Bold">Bold</option>
                        <option value="Minimal">Minimal</option>
                      </select>
                    </div>

                    {/* Question 5: Visual Intensity */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>5. Visual Intensity</label>
                      <select
                        className="form-select"
                        value={aiThemeAnswers.intensity}
                        onChange={e => setAiThemeAnswers({ ...aiThemeAnswers, intensity: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      >
                        <option value="">Select intensity...</option>
                        <option value="Subtle">Subtle</option>
                        <option value="Balanced">Balanced</option>
                        <option value="High Contrast">High Contrast</option>
                      </select>
                    </div>

                    {/* Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerateTheme}
                      disabled={generatingTheme}
                      className="btn btn-primary"
                      style={{ marginTop: 8, fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      {generatingTheme ? 'Generating Theme...' : 'Generate Theme with AI'}
                    </button>

                    {/* Error Display */}
                    {aiThemeError && (
                      <div style={{ color: 'var(--shell-red)', fontSize: '0.75rem', marginTop: 4 }}>
                        {aiThemeError}
                      </div>
                    )}

                    {/* Success Message */}
                    {form.selectedTheme === 'ai-generated' && !generatingTheme && !aiThemeError && (
                      <div style={{ color: 'var(--shell-glow)', fontSize: '0.75rem', marginTop: 4 }}>
                        ✓ AI theme generated and selected! Check the preview above.
                      </div>
                    )}
                  </div>
                </div>
                {/* END NEW */}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4 flex gap-3 items-center">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Creating...' : 'Create Event (Draft)'}
          </button>
          {error && <span style={{ color: 'var(--shell-red)', fontSize: '0.85rem' }}>{error}</span>}
        </div>
      </form>
    </div>
  );
}

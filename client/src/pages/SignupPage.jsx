import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Zap, ChevronDown } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'Design', 'Sciences', 'Other'];
const INTEREST_OPTIONS = ['tech', 'ai', 'hackathons', 'workshops', 'cultural', 'music', 'dance', 'drama', 'sports', 'design', 'robotics', 'management', 'gaming', 'art'];

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    year: '',
    interests: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department || null,
        year: form.year ? parseInt(form.year) : null,
        interests: form.interests
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--shell-bg)', fontFamily: 'var(--font-mono)', padding: '24px 0'
    }}>
      <div className="crt-overlay" />
      <div style={{ width: '100%', maxWidth: 520, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--shell-glow)',
            letterSpacing: 3, textShadow: '0 0 14px rgba(0,255,65,0.5)', lineHeight: 2
          }}>
            CAMPUS FLOW
          </h1>
          <div style={{
            fontSize: '0.65rem', color: 'var(--shell-text-dim)', textTransform: 'uppercase',
            letterSpacing: 2, marginTop: 4
          }}>
            Create Your Account
          </div>
        </div>

        {/* Signup panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">
              <Zap size={12} style={{ display: 'inline', marginRight: 6 }} />
              New User Registration
            </span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              {/* Name & Email */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@campus.edu" required />
                </div>
              </div>

              {/* Password */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 4 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-input" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" required />
                </div>
              </div>

              {/* Role selector */}
              <div className="form-group">
                <label className="form-label">I am a...</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'student', label: 'Student', color: 'var(--shell-cyan)' },
                    { value: 'organizer', label: 'Organizer', color: 'var(--shell-amber)' },
                    { value: 'admin', label: 'Admin', color: 'var(--shell-red)' }
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      style={{
                        flex: 1, padding: '10px 12px', cursor: 'pointer',
                        background: form.role === r.value ? `${r.color}18` : 'var(--shell-bg)',
                        border: `2px solid ${form.role === r.value ? r.color : 'var(--shell-border)'}`,
                        borderRadius: 'var(--radius)', color: form.role === r.value ? r.color : 'var(--shell-text-dim)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: form.role === r.value ? 600 : 400,
                        transition: 'all 0.15s'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department & Year */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div className="form-group">
                <label className="form-label">Interests (pick any)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {INTEREST_OPTIONS.map(interest => {
                    const selected = form.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        style={{
                          padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer',
                          background: selected ? 'rgba(0,255,65,0.12)' : 'transparent',
                          border: `1px solid ${selected ? 'var(--shell-glow)' : 'var(--shell-border)'}`,
                          borderRadius: '2px', fontFamily: 'var(--font-mono)',
                          color: selected ? 'var(--shell-glow)' : 'var(--shell-text-dim)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, color: 'var(--shell-red)',
                  fontSize: '0.8rem', marginBottom: 12,
                  padding: '8px 10px', background: 'rgba(255,51,51,0.08)',
                  border: '1px solid rgba(255,51,51,0.2)', borderRadius: 'var(--radius)'
                }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ justifyContent: 'center', padding: '10px 16px' }}
              >
                <UserPlus size={14} /> {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span className="text-dim text-sm">Already have an account? </span>
              <Link to="/login" className="text-glow text-sm" style={{ textDecoration: 'none' }}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

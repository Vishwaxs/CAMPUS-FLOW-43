import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--shell-bg)', fontFamily: 'var(--font-mono)'
    }}>
      <div className="crt-overlay" />
      <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--shell-glow)',
            letterSpacing: 3, textShadow: '0 0 14px rgba(229,9,20,0.7)', lineHeight: 2
          }}>
            CAMPUS FLOW
          </h1>
          <div style={{
            fontSize: '0.65rem', color: 'var(--shell-text-dim)', textTransform: 'uppercase',
            letterSpacing: 2, marginTop: 4
          }}>
            Campus as a Platform
          </div>
        </div>

        {/* Login panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">
              <Zap size={12} style={{ display: 'inline', marginRight: 6 }} />
              System Login
            </span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
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
                <LogIn size={14} /> {loading ? 'Authenticating...' : 'Log In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span className="text-dim text-sm">No account? </span>
              <Link to="/signup" className="text-glow text-sm" style={{ textDecoration: 'none' }}>
                Create one
              </Link>
            </div>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: 16, padding: 12, border: '1px solid var(--shell-border)',
          borderRadius: 'var(--radius)', background: 'var(--shell-surface)', fontSize: '0.7rem'
        }}>
          <div style={{ color: 'var(--shell-amber)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Demo Accounts
          </div>
          <div className="text-dim" style={{ lineHeight: 1.8 }}>
            <div><span className="text-glow">Student:</span> ananya@campus.edu</div>
            <div><span className="text-amber">Organizer:</span> priya@campus.edu</div>
            <div><span style={{ color: 'var(--shell-red)' }}>Admin:</span> admin@campus.edu</div>
            <div style={{ marginTop: 4, color: 'var(--shell-text-dim)' }}>Password for all: <span style={{ color: 'var(--shell-text-bright)' }}>pass123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

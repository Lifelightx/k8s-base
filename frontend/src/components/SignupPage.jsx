import { useState } from 'react';
import { authRegister } from '../services/auth';

export default function SignupPage({ onSuccess, onLogin, onBack }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authRegister(name, email, password);
      onSuccess(data.user ?? data);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-left" />
      <div className="auth-glow auth-glow-right" />

      <button id="btn-signup-back" className="auth-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <span className="land-logo-icon">✦</span>
          <span className="land-logo-text">NoteFlow</span>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Start managing your notes in seconds</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form id="form-signup" onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="signup-name" className="auth-label">Full name</label>
            <input
              id="signup-name"
              type="text"
              className="auth-input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-email" className="auth-label">Email</label>
            <input
              id="signup-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-password" className="auth-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className="auth-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            id="btn-signup-submit"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button id="btn-goto-login" className="auth-link-btn" onClick={onLogin}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { authRegister } from '../services/auth';

const inputCls = "w-full px-4 py-3 bg-[rgba(23,32,25,0.5)] border border-border2 rounded-xl text-text text-sm outline-none transition-all duration-200 placeholder:text-text3 focus:border-accent focus:shadow-[0_0_0_3px_rgba(231,76,60,0.15)]";

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
    setLoading(true); setError('');
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
    <div className="auth-page min-h-screen w-full flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[700px] rounded-full bg-[radial-gradient(circle,rgba(231,76,60,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,118,117,0.08)_0%,transparent_70%)] pointer-events-none" />

      <button
        id="btn-signup-back"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-text3 text-sm font-medium hover:text-text transition-colors duration-200 bg-transparent border-none cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div className="bg-surface/60 backdrop-blur-xl border border-border2 rounded-[28px] p-10 w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.4)] relative z-10 my-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl text-accent">✦</span>
          <span className="text-lg font-bold text-text tracking-tight">NoteFlow</span>
        </div>

        <h2 className="text-2xl font-bold text-text mb-1">Create your account</h2>
        <p className="text-sm text-text2 mb-8">Start managing your notes in seconds</p>

        {error && (
          <div role="alert" className="mb-5 px-4 py-3 bg-[rgba(231,76,60,0.1)] border border-accent/40 rounded-xl text-sm text-[#ff7675]">
            {error}
          </div>
        )}

        <form id="form-signup" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-name" className="text-xs font-semibold text-text2 uppercase tracking-wider">Full name</label>
            <input id="signup-name" type="text" className={inputCls} placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} autoComplete="name" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-email" className="text-xs font-semibold text-text2 uppercase tracking-wider">Email</label>
            <input id="signup-email" type="email" className={inputCls} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-password" className="text-xs font-semibold text-text2 uppercase tracking-wider">Password</label>
            <input id="signup-password" type="password" className={inputCls} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-confirm" className="text-xs font-semibold text-text2 uppercase tracking-wider">Confirm password</label>
            <input id="signup-confirm" type="password" className={inputCls} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
          <button
            id="btn-signup-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 mt-2 rounded-xl font-semibold text-sm bg-accent text-[#0a1a10] border border-accent shadow-[0_4px_16px_rgba(231,76,60,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent2 hover:shadow-[0_8px_24px_rgba(231,76,60,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <span className="spinner w-4 h-4 border-2" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text3">
          Already have an account?{' '}
          <button id="btn-goto-login" onClick={onLogin} className="text-accent font-semibold hover:text-accent2 transition-colors duration-200 bg-transparent border-none cursor-pointer">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

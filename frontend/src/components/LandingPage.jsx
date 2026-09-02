import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Smart Notes',
    desc: 'Create and organize your notes with priority tagging — high, medium, or low — so you always tackle what matters most.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Real-Time Sync',
    desc: 'Your notes stay in sync across every device. Whether you\'re online or offline, changes are captured and synced instantly.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Private & Secure',
    desc: 'Your notes are yours alone. Every account is isolated — nobody else can see, edit, or access your personal data.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Priority System',
    desc: 'Tag notes as High, Medium, or Low priority. Filter your list and focus your energy where it truly counts.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'AI Assistance',
    desc: 'Powered by an LLM backend, get intelligent suggestions and summaries for your notes right inside the app.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    title: 'Filter & Sort',
    desc: 'Instantly filter by All / Active / Done and sort by date or priority. Find the right note in milliseconds.',
  },
];

export default function LandingPage({ onLogin, onSignup }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouse = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
      hero.style.setProperty('--gx', `${50 + x}%`);
      hero.style.setProperty('--gy', `${50 + y}%`);
    };
    hero.addEventListener('mousemove', handleMouse);
    return () => hero.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="landing">

      {/* ── Nav ── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-logo">
            <span className="land-logo-icon">✦</span>
            <span className="land-logo-text">NoteFlow</span>
          </div>
          <div className="land-nav-actions">
            <button id="btn-nav-login" className="land-btn-ghost" onClick={onLogin}>Log in</button>
            <button id="btn-nav-signup" className="land-btn-primary" onClick={onSignup}>Get started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="land-hero" ref={heroRef}>
        <div className="land-hero-glow" />
        <div className="land-hero-content">
          <div className="land-badge">
            <span className="land-badge-dot" />
            Now with AI-powered suggestions
          </div>
          <h1 className="land-hero-title">
            Your notes,<br />
            <span className="land-hero-accent">beautifully organised</span>
          </h1>
          <p className="land-hero-sub">
            NoteFlow is a lightning-fast, privacy-first note manager with smart priorities, real-time sync, and AI assistance — all in one place.
          </p>
          <div className="land-hero-cta">
            <button id="btn-hero-signup" className="land-btn-primary land-btn-lg" onClick={onSignup}>
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button id="btn-hero-login" className="land-btn-outline land-btn-lg" onClick={onLogin}>Sign in</button>
          </div>
          <p className="land-hero-note">No credit card required · Free forever for personal use</p>
        </div>

        {/* floating preview card */}
        <div className="land-preview">
          <div className="land-preview-header">
            <span className="lp-dot lp-red" /><span className="lp-dot lp-yellow" /><span className="lp-dot lp-green" />
            <span className="lp-title">My Notes</span>
          </div>
          <div className="land-preview-body">
            {[
              { text: 'Ship v2.0 release notes', p: 'high', done: false },
              { text: 'Review pull requests', p: 'medium', done: false },
              { text: 'Update documentation', p: 'low', done: true },
              { text: 'Weekly team standup', p: 'medium', done: false },
              { text: 'Deploy to production', p: 'high', done: true },
            ].map((item, i) => (
              <div key={i} className={`lp-item lp-p-${item.p}${item.done ? ' lp-done' : ''}`} style={{ animationDelay: `${i * 80}ms` }}>
                <span className={`lp-check${item.done ? ' lp-checked' : ''}`}>
                  {item.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                <span className="lp-item-text">{item.text}</span>
                <span className={`lp-badge lp-badge-${item.p}`}>{item.p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="land-stats">
        {[
          { val: '10k+', label: 'Notes created' },
          { val: '99.9%', label: 'Uptime' },
          { val: '<50ms', label: 'Sync speed' },
          { val: '100%', label: 'Private' },
        ].map((s) => (
          <div key={s.label} className="land-stat-item">
            <span className="land-stat-val">{s.val}</span>
            <span className="land-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="land-features">
        <div className="land-section-label">Features</div>
        <h2 className="land-section-title">Everything you need, nothing you don't</h2>
        <p className="land-section-sub">Built for focus. Every feature earns its place.</p>
        <div className="land-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="land-feature-card">
              <div className="land-feature-icon">{f.icon}</div>
              <h3 className="land-feature-title">{f.title}</h3>
              <p className="land-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="land-cta-section">
        <div className="land-cta-glow" />
        <h2 className="land-cta-title">Ready to get organised?</h2>
        <p className="land-cta-sub">Join thousands of people who trust NoteFlow to manage their day.</p>
        <div className="land-hero-cta">
          <button id="btn-cta-signup" className="land-btn-primary land-btn-lg" onClick={onSignup}>
            Create free account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button id="btn-cta-login" className="land-btn-outline land-btn-lg" onClick={onLogin}>Sign in instead</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="land-footer">
        <div className="land-logo">
          <span className="land-logo-icon">✦</span>
          <span className="land-logo-text">NoteFlow</span>
        </div>
        <p className="land-footer-copy">© 2026 NoteFlow. Built with care.</p>
      </footer>
    </div>
  );
}

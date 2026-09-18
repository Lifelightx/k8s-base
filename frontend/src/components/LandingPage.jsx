import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    title: 'Smart Notes',
    desc: 'Create and organize your notes with priority tagging — high, medium, or low — so you always tackle what matters most.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Real-Time Sync',
    desc: "Your notes stay in sync across every device. Whether you're online or offline, changes are captured and synced instantly.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Private & Secure',
    desc: 'Your notes are yours alone. Every account is isolated — nobody else can see, edit, or access your personal data.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    title: 'Priority System',
    desc: 'Tag notes as High, Medium, or Low priority. Filter your list and focus your energy where it truly counts.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: 'AI Assistance',
    desc: 'Powered by an LLM backend, get intelligent suggestions and summaries for your notes right inside the app.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    title: 'Filter & Sort',
    desc: 'Instantly filter by All / Active / Done and sort by date or priority. Find the right note in milliseconds.',
  },
];

const PCOLOR = {
  high:   { dot: '#e05252', bg: 'rgba(224,82,82,0.12)',  text: '#e05252' },
  medium: { dot: '#d97706', bg: 'rgba(217,119,6,0.12)',  text: '#d97706' },
  low:    { dot: '#2ecc71', bg: 'rgba(46,204,113,0.12)', text: '#2ecc71' },
};

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
    <div className="landing min-h-screen w-full bg-bg text-text font-[Inter,sans-serif] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-text">
            <span className="text-accent text-2xl">✦</span>
            NoteFlow
          </div>
          <div className="flex items-center gap-3">
            <button id="btn-nav-login" onClick={onLogin} className="px-4 py-2 text-sm font-medium text-text2 hover:text-text bg-transparent border-none cursor-pointer transition-colors duration-200">Log in</button>
            <button id="btn-nav-signup" onClick={onSignup} className="px-5 py-2 text-sm font-semibold rounded-xl bg-accent text-[#0a1a10] border border-accent shadow-[0_4px_12px_rgba(231,76,60,0.3)] hover:bg-accent2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgba(231,76,60,0.12)_0%,transparent_60%)] transition-all duration-300" />
        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-text2 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] shadow-[0_0_6px_#2ecc71]" />
              Now with AI-powered suggestions
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-text">
              Your notes,<br />
              <span className="bg-gradient-to-r from-accent via-accent2 to-[#f59e0b] bg-clip-text text-transparent">beautifully organised</span>
            </h1>
            <p className="text-lg text-text2 leading-relaxed max-w-lg">
              NoteFlow is a lightning-fast, privacy-first note manager with smart priorities, real-time sync, and AI assistance — all in one place.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button id="btn-hero-signup" onClick={onSignup} className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-accent text-[#0a1a10] border border-accent shadow-[0_4px_16px_rgba(231,76,60,0.35)] hover:bg-accent2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(231,76,60,0.5)] transition-all duration-200 cursor-pointer">
                Start for free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button id="btn-hero-login" onClick={onLogin} className="px-6 py-3.5 rounded-xl font-semibold text-sm text-text border border-border2 bg-surface hover:border-border hover:bg-surface2 transition-all duration-200 cursor-pointer">Sign in</button>
            </div>
            <p className="text-xs text-text3">No credit card required · Free forever for personal use</p>
          </div>

          {/* Right — preview card */}
          <div className="bg-surface/80 backdrop-blur-md border border-border2 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
            {/* Window dots */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-[#e05252]" />
              <span className="w-3 h-3 rounded-full bg-[#d97706]" />
              <span className="w-3 h-3 rounded-full bg-[#2ecc71]" />
              <span className="ml-auto text-xs text-text3 font-medium">My Notes</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {[
                { text: 'Ship v2.0 release notes', p: 'high',   done: false },
                { text: 'Review pull requests',    p: 'medium', done: false },
                { text: 'Update documentation',   p: 'low',    done: true  },
                { text: 'Weekly team standup',     p: 'medium', done: false },
                { text: 'Deploy to production',   p: 'high',   done: true  },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-300 ${item.done ? 'opacity-50' : ''}`}
                  style={{ background: PCOLOR[item.p].bg, borderColor: PCOLOR[item.p].dot + '40', animationDelay: `${i * 80}ms` }}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${item.done ? 'bg-[#2ecc71] border-[#2ecc71]' : 'border-border2'}`}>
                    {item.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className={`flex-1 text-sm ${item.done ? 'line-through text-text3' : 'text-text'}`}>{item.text}</span>
                  <span className="text-[0.65rem] font-semibold capitalize px-2 py-0.5 rounded-full" style={{ color: PCOLOR[item.p].text, background: PCOLOR[item.p].bg }}>
                    {item.p}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-border bg-surface/30 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '10k+', label: 'Notes created' },
            { val: '99.9%', label: 'Uptime' },
            { val: '<50ms', label: 'Sync speed' },
            { val: '100%', label: 'Private' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-text">{s.val}</span>
              <span className="text-sm text-text3">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold text-accent uppercase tracking-widest mb-3 px-3 py-1 bg-[rgba(231,76,60,0.08)] border border-accent/30 rounded-full">Features</div>
            <h2 className="text-4xl font-extrabold text-text mb-4">Everything you need, nothing you don't</h2>
            <p className="text-text2 text-lg max-w-xl mx-auto">Built for focus. Every feature earns its place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface border border-border rounded-2xl p-8 hover:border-border2 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[rgba(231,76,60,0.1)] border border-accent/20 flex items-center justify-center text-accent mb-5">{f.icon}</div>
                <h3 className="text-base font-bold text-text mb-2">{f.title}</h3>
                <p className="text-sm text-text2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(231,76,60,0.12)_0%,transparent_70%)]" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-text mb-4">Ready to get organised?</h2>
          <p className="text-text2 text-lg mb-10">Join thousands of people who trust NoteFlow to manage their day.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button id="btn-cta-signup" onClick={onSignup} className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-accent text-[#0a1a10] border border-accent shadow-[0_4px_16px_rgba(231,76,60,0.35)] hover:bg-accent2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              Create free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button id="btn-cta-login" onClick={onLogin} className="px-6 py-3.5 rounded-xl font-semibold text-sm text-text border border-border2 bg-surface hover:border-border hover:bg-surface2 transition-all duration-200 cursor-pointer">Sign in instead</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-text">
            <span className="text-accent">✦</span>
            NoteFlow
          </div>
          <p className="text-sm text-text3">© 2026 NoteFlow. Built with care.</p>
        </div>
      </footer>
    </div>
  );
}

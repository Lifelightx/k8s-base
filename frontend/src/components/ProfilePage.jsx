import { useState, useEffect } from 'react';
import { authMe } from '../services/auth';

const STAT_CARDS = (stats) => [
  { label: 'Total Tasks', value: stats.total,     color: '#2ecc71', icon: '📋' },
  { label: 'Completed',   value: stats.completed,  color: '#6366f1', icon: '✅' },
  { label: 'Active',      value: stats.active,      color: '#d97706', icon: '⚡' },
  { label: 'High Priority', value: stats.byPriority?.high ?? 0, color: '#e05252', icon: '🔴' },
];

export default function ProfilePage({ onBack, onLogout, stats }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authMe()
      .then((data) => setUser(data.user || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (loading) {
    return (
      <div className="profile-page">
        <div className="state-center"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Top bar */}
      <div className="profile-topbar">
        <button className="td-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Tasks
        </button>
      </div>

      <div className="profile-content">
        {/* Hero card */}
        <div className="profile-hero">
          <div className="profile-bg-glow" />
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {initials}
            </div>
            <div className="profile-avatar-ring" />
          </div>
          <h2 className="profile-name">{user?.name || 'Anonymous User'}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="profile-role-badge">Member</span>
        </div>

        {/* Stats grid */}
        <div className="profile-stats-title">Your Activity</div>
        <div className="profile-stats-grid">
          {STAT_CARDS(stats || { total: 0, completed: 0, active: 0, byPriority: {} }).map((s) => (
            <div className="profile-stat-card" key={s.label} style={{ '--stat-color': s.color }}>
              <div className="profile-stat-icon">{s.icon}</div>
              <div className="profile-stat-value">{s.value}</div>
              <div className="profile-stat-label">{s.label}</div>
              <div className="profile-stat-bar" style={{ width: `${Math.min(100, (s.value / Math.max(stats?.total || 1, 1)) * 100)}%` }} />
            </div>
          ))}
        </div>

        {/* Info section */}
        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Full Name
            </span>
            <span className="profile-info-value">{user?.name || '—'}</span>
          </div>
          <div className="profile-info-divider" />
          <div className="profile-info-row">
            <span className="profile-info-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email Address
            </span>
            <span className="profile-info-value">{user?.email || '—'}</span>
          </div>
        </div>

        {/* Sign out */}
        <button className="profile-signout-btn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

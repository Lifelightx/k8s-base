import { useState, useRef, useEffect } from 'react';

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const P_COLORS = {
  high:   { bg: 'rgba(224,82,82,0.12)',   border: '#e05252', text: '#e05252', label: 'High' },
  medium: { bg: 'rgba(217,119,6,0.12)',   border: '#d97706', text: '#d97706', label: 'Medium' },
  low:    { bg: 'rgba(46,204,113,0.12)',   border: '#2ecc71', text: '#2ecc71', label: 'Low' },
};

export default function TodoItem({ todo, onToggle, onDelete, onClick }) {
  const [leaving, setLeaving] = useState(false);
  const p = todo.priority || 'medium';
  const pc = P_COLORS[p];

  const handleDelete = (e) => {
    e.stopPropagation();
    setLeaving(true);
    setTimeout(() => onDelete(todo._id), 250);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(todo._id);
  };

  return (
    <div
      className={`task-card${todo.completed ? ' is-done' : ''}${leaving ? ' leaving' : ''}`}
      style={{
        '--p-border': pc.border,
        '--p-bg': pc.bg,
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={() => onClick(todo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(todo)}
    >
      {/* Priority top strip */}
      <div className="task-card-strip" style={{ background: pc.border }} />

      {/* Header row */}
      <div className="task-card-header">
        <div
          className={`task-check${todo.completed ? ' done' : ''}`}
          role="checkbox"
          aria-checked={todo.completed}
          tabIndex={0}
          onClick={handleToggle}
          onKeyDown={(e) => e.key === 'Enter' && handleToggle(e)}
          title={todo.completed ? 'Mark active' : 'Mark done'}
        >
          {todo.completed && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        <button
          className="icon-btn red task-card-delete"
          onClick={handleDelete}
          aria-label="Delete"
          title="Delete"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="task-card-body">
        <p className="task-card-title">{todo.text}</p>
        {todo.description && (
          <p className="task-card-desc">{todo.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="task-card-footer">
        <span className="task-time">{timeAgo(todo.createdAt)}</span>
        <span
          className="task-card-priority"
          style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}
        >
          {pc.label}
        </span>
      </div>
    </div>
  );
}

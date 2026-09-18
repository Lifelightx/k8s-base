import { useState } from 'react';

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const P = {
  high:   { bg: 'rgba(224,82,82,0.12)',  border: '#e05252', text: '#e05252', label: 'High'   },
  medium: { bg: 'rgba(217,119,6,0.12)',  border: '#d97706', text: '#d97706', label: 'Medium' },
  low:    { bg: 'rgba(46,204,113,0.12)', border: '#2ecc71', text: '#2ecc71', label: 'Low'    },
};

export default function TodoItem({ todo, onToggle, onDelete, onClick }) {
  const [leaving, setLeaving] = useState(false);
  const p = todo.priority || 'medium';
  const pc = P[p];

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
      className={`relative break-inside-avoid mb-4 bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-border2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] group ${
        todo.completed ? 'opacity-60' : ''
      }`}
      style={{
        opacity: leaving ? 0 : undefined,
        transform: leaving ? 'scale(0.95)' : undefined,
        transition: leaving ? 'opacity 0.25s ease, transform 0.25s ease' : undefined,
        borderLeftColor: pc.border,
        borderLeftWidth: '3px',
      }}
      onClick={() => onClick(todo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(todo)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        {/* Checkbox */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
            todo.completed
              ? 'bg-[#2ecc71] border-[#2ecc71]'
              : 'border-border2 hover:border-[#2ecc71]'
          }`}
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

        {/* Delete button */}
        <button
          className="w-6 h-6 flex items-center justify-center rounded text-text3 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red hover:bg-redBg"
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
      <div className="px-3 py-1">
        <p className={`text-sm font-medium leading-snug ${todo.completed ? 'line-through text-text3' : 'text-text'}`}>
          {todo.text}
        </p>
        {todo.description && (
          <p className="text-xs text-text2 mt-1 leading-relaxed line-clamp-2">{todo.description}</p>
        )}
        {todo.tags && todo.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {todo.tags.map(t => (
              <span key={t} className="text-[0.65rem] px-1.5 py-0.5 rounded bg-surface2 border border-border text-text2">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 mt-1">
        <span className="text-[0.65rem] text-text3">{timeAgo(todo.createdAt)}</span>
        <div className="flex items-center gap-2">
          {todo.project && todo.project !== 'Inbox' && (
            <span className="text-[0.65rem] text-text3 bg-surface2 border border-border px-1.5 py-0.5 rounded">
              📁 {todo.project}
            </span>
          )}
          {todo.subtasks && todo.subtasks.length > 0 && (
            <span className="text-[0.65rem] text-text3">
              ✓ {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length}
            </span>
          )}
          <span
            className="text-[0.7rem] px-2 py-0.5 rounded-full font-semibold capitalize"
            style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}
          >
            {pc.label}
          </span>
        </div>
      </div>
    </div>
  );
}

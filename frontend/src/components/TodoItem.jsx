import { useState, useRef, useEffect } from 'react';

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const Check = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Pencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);
const Trash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const Save = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const P_CLASS = { high: 'ph', medium: 'pm', low: 'pl' };

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing]     = useState(false);
  const [editText, setEditText]   = useState(todo.text);
  const [editP, setEditP]         = useState(todo.priority || 'medium');
  const [leaving, setLeaving]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const startEdit = () => { setEditText(todo.text); setEditP(todo.priority || 'medium'); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit = async () => {
    const t = editText.trim();
    if (!t) return;
    await onUpdate(todo._id, { text: t, priority: editP });
    setEditing(false);
  };

  const handleDelete = () => {
    setLeaving(true);
    setTimeout(() => onDelete(todo._id), 250);
  };

  const p = todo.priority || 'medium';

  return (
    <div
      className={`task-item${todo.completed ? ' is-done' : ''} ${P_CLASS[p]}${leaving ? ' leaving' : ''}`}
      style={leaving ? { opacity:0, transform:'translateX(12px)', transition:'all 0.25s ease' } : {}}
    >
      {/* Checkbox */}
      <div
        id={`chk-${todo._id}`}
        className={`task-check${todo.completed ? ' done' : ''}`}
        role="checkbox"
        aria-checked={todo.completed}
        tabIndex={0}
        onClick={() => onToggle(todo._id)}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(todo._id)}
        title={todo.completed ? 'Mark active' : 'Mark done'}
      >
        {todo.completed && <Check />}
      </div>

      {/* Content */}
      <div className="task-body">
        {editing ? (
          <>
            <input
              ref={inputRef}
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              maxLength={200}
            />
            <div className="edit-controls">
              {['high','medium','low'].map((pr) => (
                <button key={pr} type="button"
                  className={`p-chip${editP === pr ? ` sel-${pr}` : ''}`}
                  onClick={() => setEditP(pr)}>
                  {pr.charAt(0).toUpperCase()+pr.slice(1)}
                </button>
              ))}
              <span style={{ marginLeft:'auto', display:'flex', gap:'0.25rem' }}>
                <button className="icon-btn green" onClick={saveEdit} title="Save (Enter)"><Save /></button>
                <button className="btn btn-ghost" onClick={cancelEdit} style={{ padding:'3px 8px', fontSize:'0.75rem' }}>Cancel</button>
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="task-text">{todo.text}</span>
            <div className="task-meta-row">
              <span className="task-time">{timeAgo(todo.createdAt)}</span>
              <span className={`p-badge ${p}`}>{p}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div className="task-actions">
          <button id={`edit-${todo._id}`} className="icon-btn" onClick={startEdit} aria-label="Edit"><Pencil /></button>
          <button id={`del-${todo._id}`}  className="icon-btn red" onClick={handleDelete} aria-label="Delete"><Trash /></button>
        </div>
      )}
    </div>
  );
}

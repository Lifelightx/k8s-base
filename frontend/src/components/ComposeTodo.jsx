import { useState, useRef, useEffect } from 'react';

export default function ComposeTodo({ onAdd }) {
  const [text, setText]         = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'n' && e.target.tagName === 'BODY' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submit = async (e) => {
    e?.preventDefault();
    const val = text.trim();
    if (!val || loading) return;
    setLoading(true);
    try {
      await onAdd(val, priority);
      setText('');
      setPriority('medium');
    } finally { setLoading(false); }
  };

  return (
    <form className="compose" onSubmit={submit}>
      <div className="compose-row">
        <input
          ref={inputRef}
          id="task-input"
          className="compose-input"
          placeholder="What needs to get done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
            if (e.key === 'Escape') { setText(''); inputRef.current?.blur(); }
          }}
          maxLength={200}
          autoComplete="off"
        />
        <button
          id="btn-add-task"
          type="submit"
          className="compose-add-btn"
          disabled={loading || !text.trim()}
        >
          {loading ? <span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>
              </svg>
              Add task
            </>
          )}
        </button>
      </div>
      <div className="compose-footer">
        <div style={{ display:'flex', alignItems:'center', gap:'0' }}>
          <span className="priority-label">Priority</span>
          <div className="priority-chips">
            {['high','medium','low'].map((p) => (
              <button
                key={p} type="button"
                id={`p-${p}`}
                className={`p-chip${priority === p ? ` sel-${p}` : ''}`}
                onClick={() => setPriority(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span className="compose-hint"><kbd>Enter</kbd> to add</span>
      </div>
    </form>
  );
}

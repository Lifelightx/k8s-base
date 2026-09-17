import { useState, useRef, useEffect } from 'react';
import './ComposeTodo.css';

export default function ComposeTodo({ onAdd }) {
  const [text, setText]         = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate]   = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]         = useState([]);
  const [recurrence, setRecurrence] = useState('none');
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

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const submit = async (e) => {
    e?.preventDefault();
    const val = text.trim();
    if (!val || loading) return;
    setLoading(true);
    try {
      await onAdd(val, priority, dueDate || null, remindersEnabled, tags, recurrence);
      setText('');
      setPriority('medium');
      setDueDate('');
      setRemindersEnabled(true);
      setTags([]);
      setRecurrence('none');
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

      {/* Tags Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0 1rem', flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span key={t} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t}
            <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}>&times;</button>
          </span>
        ))}
        <input 
          type="text" 
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add a tag (press Enter)"
          style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', border: 'none', background: 'transparent', outline: 'none' }}
        />
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
        
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', paddingLeft: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="priority-label">Due</span>
            <input 
              type="datetime-local" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', background: 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input 
              type="checkbox" 
              id="reminders-check-compose"
              checked={remindersEnabled} 
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              disabled={!dueDate}
              style={{ cursor: dueDate ? 'pointer' : 'not-allowed' }}
            />
            <label htmlFor="reminders-check-compose" style={{ fontSize: '0.85rem', color: dueDate ? '#4b5563' : '#9ca3af', cursor: dueDate ? 'pointer' : 'not-allowed' }}>
              Reminders
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
            <span className="priority-label">Recurrence</span>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', background: 'transparent' }}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <span className="compose-hint" style={{ marginLeft: 'auto' }}><kbd>Enter</kbd> to add</span>
      </div>
    </form>
  );
}

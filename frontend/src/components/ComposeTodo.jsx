import { useState, useRef, useEffect } from 'react';
import CustomDatePicker from './CustomDatePicker';
import CustomSelect from './CustomSelect';

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
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => setTags(tags.filter(t => t !== tagToRemove));

  const submit = async (e) => {
    e?.preventDefault();
    const val = text.trim();
    if (!val || loading) return;
    setLoading(true);
    try {
      await onAdd(val, priority, dueDate || null, remindersEnabled, tags, recurrence);
      setText(''); setPriority('medium'); setDueDate('');
      setRemindersEnabled(true); setTags([]); setRecurrence('none');
    } finally { setLoading(false); }
  };

  const priorityChipClass = (p) => {
    const base = 'px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 border';
    if (priority === p) {
      if (p === 'high')   return `${base} bg-[rgba(224,82,82,0.15)] text-[#e05252] border-[#e05252]`;
      if (p === 'medium') return `${base} bg-[rgba(217,119,6,0.15)] text-[#d97706] border-[#d97706]`;
      return `${base} bg-[rgba(46,204,113,0.15)] text-[#2ecc71] border-[#2ecc71]`;
    }
    return `${base} bg-transparent text-text3 border-border hover:border-border2`;
  };

  return (
    <form
      className="bg-surface border border-border rounded-xl mb-6 overflow-hidden transition-all duration-200 focus-within:border-border2 focus-within:shadow-[0_0_0_1px_rgba(46,61,50,0.8)]"
      onSubmit={submit}
    >
      {/* Main input row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          ref={inputRef}
          id="task-input"
          className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-text3 min-w-0"
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
          disabled={loading || !text.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold cursor-pointer text-sm px-4 py-2 transition-all duration-200 bg-accent text-[#0a1a10] border border-accent shadow-[0_4px_12px_rgba(231,76,60,0.25)] hover:-translate-y-0.5 hover:bg-accent2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
        >
          {loading
            ? <span className="spinner w-3.5 h-3.5 border-2" />
            : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>
                </svg>
                Add task
              </>
          }
        </button>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 px-4 py-1.5 flex-wrap border-t border-border/40">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 bg-surface2 text-text border border-border rounded-full px-2 py-0.5 text-xs">
            #{t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="bg-none border-none text-text3 cursor-pointer p-0 text-sm leading-none hover:text-text"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add a tag…"
          className="text-xs bg-transparent outline-none border-none text-text placeholder:text-text3 min-w-[100px]"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/40 flex-wrap">
        {/* Priority chips */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text3 font-medium">Priority</span>
          <div className="flex gap-1">
            {['high','medium','low'].map(p => (
              <button
                key={p}
                type="button"
                id={`p-${p}`}
                onClick={() => setPriority(p)}
                className={priorityChipClass(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text3 font-medium">Due</span>
          <CustomDatePicker
            selected={dueDate ? new Date(dueDate) : null}
            onChange={(date) => setDueDate(date ? date.toISOString() : '')}
          />
        </div>

        {/* Reminders */}
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="reminders-check-compose"
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.target.checked)}
            disabled={!dueDate}
            className="accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
          <label
            htmlFor="reminders-check-compose"
            className={`text-xs ${dueDate ? 'text-text cursor-pointer' : 'text-text3 cursor-not-allowed'}`}
          >
            Reminders
          </label>
        </div>

        {/* Recurrence */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text3 font-medium">Recurrence</span>
          <CustomSelect
            value={recurrence}
            onChange={setRecurrence}
            options={[
              { value: 'none', label: 'None' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ]}
          />
        </div>

        {/* Hint */}
        <span className="ml-auto text-[0.7rem] text-text3 hidden sm:block">
          <kbd className="px-1.5 py-0.5 bg-surface2 border border-border rounded text-text2 font-mono text-[0.65rem]">Enter</kbd> to add
        </span>
      </div>
    </form>
  );
}

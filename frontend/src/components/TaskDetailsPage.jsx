import { useState } from 'react';
import { planTaskWithAI } from '../services/api';
import { updateTodo } from '../services/api';

const P_COLORS = {
  high:   { bg: 'rgba(224,82,82,0.12)',  border: '#e05252', text: '#e05252', label: 'High' },
  medium: { bg: 'rgba(217,119,6,0.12)',  border: '#d97706', text: '#d97706', label: 'Medium' },
  low:    { bg: 'rgba(46,204,113,0.12)', border: '#2ecc71', text: '#2ecc71', label: 'Low' },
};

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SparkleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export default function TaskDetailsPage({ todo, onBack, onUpdate, onToggle, onDelete, toast }) {
  const [editText, setEditText]     = useState(todo.text);
  const [editDesc, setEditDesc]     = useState(todo.description || '');
  const [editP,    setEditP]        = useState(todo.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ? todo.dueDate.slice(0, 16) : '');
  const [editReminders, setEditReminders] = useState(todo.remindersEnabled ?? true);
  const [editTags, setEditTags]     = useState(todo.tags || []);
  const [tagInput, setTagInput]     = useState('');
  const [editSubtasks, setEditSubtasks] = useState(todo.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [saving,   setSaving]       = useState(false);
  const [aiPlan,   setAiPlan]       = useState(null);
  const [planning, setPlanning]     = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const pc = P_COLORS[editP];

  const handleSave = async () => {
    const t = editText.trim();
    if (!t) return;
    setSaving(true);
    try {
      await onUpdate(todo._id, { 
        text: t, 
        description: editDesc, 
        priority: editP,
        dueDate: editDueDate || null,
        remindersEnabled: editReminders,
        tags: editTags,
        subtasks: editSubtasks
      });
      toast?.('Task updated', 'success');
    } catch {
      toast?.('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePlan = async () => {
    setPlanning(true);
    setAiPlan(null);
    try {
      const res = await planTaskWithAI(editText, editDesc);
      setAiPlan(res.plan);
    } catch {
      setAiPlan('Could not generate a plan. Make sure the AI service is running.');
    } finally {
      setPlanning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(todo._id);
    onBack();
  };

  const handleToggle = async () => {
    await onToggle(todo._id);
    onBack();
  };

  return (
    <div className="task-details-page">
      {/* Top nav */}
      <div className="td-nav">
        <button className="td-back-btn" onClick={onBack}>
          <BackIcon /> Back to Tasks
        </button>
        <div className="td-nav-actions">
          <button
            className={`td-toggle-btn${todo.completed ? ' active' : ''}`}
            onClick={handleToggle}
          >
            {todo.completed ? '↩ Reopen' : '✓ Mark Done'}
          </button>
          <button className="td-delete-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="td-body">
        {/* Left column — Edit */}
        <div className="td-col-edit">
          <div className="td-section-label">TASK DETAILS</div>

          {/* Priority selector */}
          <div className="td-priority-row">
            {['high', 'medium', 'low'].map((pr) => {
              const c = P_COLORS[pr];
              return (
                <button
                  key={pr}
                  className="td-p-chip"
                  style={editP === pr
                    ? { background: c.bg, color: c.text, borderColor: c.border }
                    : {}}
                  onClick={() => setEditP(pr)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div className="td-field">
            <label className="td-field-label">Title</label>
            <textarea
              className="td-title-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Task title..."
              rows={2}
            />
          </div>

          {/* Description */}
          <div className="td-field">
            <label className="td-field-label">Description</label>
            <textarea
              className="td-desc-input"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Add more context..."
              rows={5}
            />
          </div>

          {/* Due Date & Reminders */}
          <div className="td-field">
            <label className="td-field-label">Due Date & Reminders</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <input 
                type="datetime-local" 
                value={editDueDate} 
                onChange={(e) => setEditDueDate(e.target.value)} 
                className="td-title-input"
                style={{ width: 'auto', padding: '0.4rem 0.6rem', minHeight: 'unset', fontSize: '0.9rem' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: editDueDate ? 'pointer' : 'not-allowed', color: editDueDate ? '#374151' : '#9ca3af', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  checked={editReminders} 
                  onChange={(e) => setEditReminders(e.target.checked)}
                  disabled={!editDueDate}
                  style={{ cursor: editDueDate ? 'pointer' : 'not-allowed', width: '1rem', height: '1rem' }}
                />
                Send Reminders
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="td-field">
            <label className="td-field-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {editTags.map(t => (
                <span key={t} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {t}
                  <button type="button" onClick={() => setEditTags(editTags.filter(tag => tag !== t))} style={{ background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              ))}
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newTag = tagInput.trim().toLowerCase();
                    if (newTag && !editTags.includes(newTag)) {
                      setEditTags([...editTags, newTag]);
                    }
                    setTagInput('');
                  }
                }}
                placeholder="Add tag (Enter)"
                className="td-title-input"
                style={{ width: '120px', padding: '0.2rem 0.5rem', minHeight: 'unset', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Sub-tasks */}
          <div className="td-field">
            <label className="td-field-label">Sub-tasks</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {editSubtasks.map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid #f3f4f6' }}>
                  <input 
                    type="checkbox" 
                    checked={st.completed}
                    onChange={(e) => {
                      const copy = [...editSubtasks];
                      copy[i].completed = e.target.checked;
                      setEditSubtasks(copy);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', flexGrow: 1, textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? '#9ca3af' : '#374151' }}>
                    {st.title}
                  </span>
                  <button type="button" onClick={() => {
                    const copy = [...editSubtasks];
                    copy.splice(i, 1);
                    setEditSubtasks(copy);
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>&times;</button>
                </div>
              ))}
              <input 
                type="text" 
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const title = subtaskInput.trim();
                    if (title) {
                      setEditSubtasks([...editSubtasks, { title, completed: false }]);
                      setSubtaskInput('');
                    }
                  }
                }}
                placeholder="Add sub-task (Enter)"
                className="td-title-input"
                style={{ padding: '0.4rem 0.6rem', minHeight: 'unset', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="td-meta">
            <span>Created {timeAgo(todo.createdAt)}</span>
            {todo.completed && <span className="td-done-badge">✓ Completed</span>}
          </div>

          <button
            className="td-save-btn"
            onClick={handleSave}
            disabled={saving || !editText.trim()}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Right column — AI */}
        <div className="td-col-ai">
          <div className="td-section-label">AI TASK PLANNER</div>

          <div className="td-ai-card">
            <div className="td-ai-header">
              <div className="td-ai-icon">
                <SparkleIcon />
              </div>
              <div>
                <p className="td-ai-title">Break it down with AI</p>
                <p className="td-ai-sub">Get a step-by-step plan for this task</p>
              </div>
            </div>

            <button
              className="td-plan-btn"
              onClick={handlePlan}
              disabled={planning}
            >
              {planning ? (
                <>
                  <span className="td-plan-spinner" /> Generating plan...
                </>
              ) : (
                <>
                  <SparkleIcon /> {aiPlan ? 'Regenerate Plan' : 'Plan with AI'}
                </>
              )}
            </button>

            {aiPlan && (
              <div className="td-plan-result">
                <div className="td-plan-result-header">AI-Generated Plan</div>
                <div className="td-plan-steps">
                  {aiPlan.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="td-plan-step">
                      <div className="td-step-dot" />
                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!aiPlan && !planning && (
              <div className="td-ai-placeholder">
                <p>Click the button above to generate an AI-powered breakdown of your task into actionable steps.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

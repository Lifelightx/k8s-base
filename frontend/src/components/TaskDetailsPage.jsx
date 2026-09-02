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
      await onUpdate(todo._id, { text: t, description: editDesc, priority: editP });
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

import { useState, useEffect, useMemo } from 'react';
import ComposeTodo    from './components/ComposeTodo';
import TodoList       from './components/TodoList';
import ToastContainer from './components/ToastContainer';
import {
  fetchTodos, fetchStats, createTodo,
  toggleTodo, deleteTodo, updateTodo, clearCompleted,
} from './services/api';
import { useToast } from './hooks/useToast';

const FILTERS = ['All', 'Active', 'Done'];
const SORTS   = [
  { label: 'Newest first', value: 'createdAt:desc' },
  { label: 'Oldest first', value: 'createdAt:asc'  },
  { label: 'By priority',  value: 'priority:asc'   },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function App() {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [online,  setOnline]  = useState(navigator.onLine);
  const [filter,  setFilter]  = useState('All');
  const [sortKey, setSortKey] = useState('createdAt:desc');
  const [stats,   setStats]   = useState({ total:0, completed:0, active:0, byPriority:{} });
  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const refreshStats = () => fetchStats().then(setStats).catch(() => {});

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => toast('Could not load tasks', 'error'))
      .finally(() => setLoading(false));
    refreshStats();
  }, []);

  /* ── Handlers ── */
  const handleAdd = async (text, priority) => {
    try {
      const t = await createTodo(text, priority);
      setTodos((p) => [t, ...p]);
      refreshStats();
      toast('Task added', 'success');
    } catch (e) { toast(e.message || 'Failed to add', 'error'); }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTodo(id);
      setTodos((p) => p.map((t) => (t._id === id ? updated : t)));
      refreshStats();
    } catch (e) { toast(e.message || 'Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((p) => p.filter((t) => t._id !== id));
      refreshStats();
      toast('Task removed', 'info');
    } catch (e) { toast(e.message || 'Failed to delete', 'error'); }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const updated = await updateTodo(id, payload);
      setTodos((p) => p.map((t) => (t._id === id ? updated : t)));
      refreshStats();
      toast('Task updated', 'success');
    } catch (e) { toast(e.message || 'Failed to update', 'error'); }
  };

  const handleClearDone = async () => {
    try {
      const { deleted } = await clearCompleted();
      setTodos((p) => p.filter((t) => !t.completed));
      refreshStats();
      toast(`Cleared ${deleted} completed task${deleted !== 1 ? 's' : ''}`, 'info');
    } catch (e) { toast(e.message || 'Failed to clear', 'error'); }
  };

  /* ── Filter + Sort ── */
  const [sortField, sortDir] = sortKey.split(':');
  const PRANK = { high: 0, medium: 1, low: 2 };

  const filtered = useMemo(() => {
    let list = [...todos];
    if (filter === 'Active') list = list.filter((t) => !t.completed);
    if (filter === 'Done')   list = list.filter((t) =>  t.completed);
    list.sort((a, b) => {
      if (sortField === 'priority') {
        return sortDir === 'asc'
          ? PRANK[a.priority] - PRANK[b.priority]
          : PRANK[b.priority] - PRANK[a.priority];
      }
      const diff = new Date(a[sortField]) - new Date(b[sortField]);
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [todos, filter, sortKey]);

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const countFor = (f) =>
    f === 'All' ? stats.total : f === 'Active' ? stats.active : stats.completed;

  return (
    <div className="app">

      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">{greeting()}</h1>
          <div className="header-status">
            <span className={`status-dot${online ? '' : ' offline'}`} />
            {online ? 'Synced' : 'Offline'}
          </div>
        </div>
        <p className="header-sub">
          {stats.total === 0
            ? 'Ready when you are — add your first task.'
            : stats.active === 0
            ? `All ${stats.total} tasks done. Great work!`
            : `${stats.active} task${stats.active !== 1 ? 's' : ''} remaining`}
        </p>
      </header>

      {/* Progress (only when there's data) */}
      {stats.total > 0 && (
        <div className="progress-section">
          <div className="progress-meta">
            <span>{pct}% complete</span>
            <span>{stats.completed} of {stats.total} done</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Compose */}
      <ComposeTodo onAdd={handleAdd} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="filter-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`tab-${f.toLowerCase()}`}
              role="tab"
              aria-selected={filter === f}
              className={`f-tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {countFor(f) > 0 && (
                <span style={{ marginLeft:5, fontSize:'0.7rem', opacity:0.65 }}>
                  {countFor(f)}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <select
            id="sort-select"
            className="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Sort tasks"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {stats.completed > 0 && (
            <button
              id="btn-clear-done"
              className="btn-clear-done"
              onClick={handleClearDone}
              title="Remove all completed tasks"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              Clear done
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <TodoList
        todos={filtered}
        loading={loading}
        filter={filter}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      {/* Footer */}
      {stats.total > 0 && !loading && (
        <footer className="app-footer">
          <span>{stats.total} total task{stats.total !== 1 ? 's' : ''}</span>
          <span>
            High&nbsp;{stats.byPriority?.high ?? 0} &nbsp;&middot;&nbsp;
            Med&nbsp;{stats.byPriority?.medium ?? 0} &nbsp;&middot;&nbsp;
            Low&nbsp;{stats.byPriority?.low ?? 0}
          </span>
        </footer>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

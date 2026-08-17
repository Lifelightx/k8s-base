import TodoItem from './TodoItem';

const EMPTY = {
  All:    { label: 'No tasks yet',        sub: 'Add something above to get started.' },
  Active: { label: 'All caught up!',      sub: 'No active tasks right now.' },
  Done:   { label: 'Nothing completed yet', sub: 'Finish a task to see it here.' },
};

const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

export default function TodoList({ todos, loading, filter, onToggle, onDelete, onUpdate }) {
  if (loading) {
    return (
      <div className="state-center">
        <div className="spinner" />
        <span className="state-sub">Loading your tasks...</span>
      </div>
    );
  }

  if (!todos.length) {
    const { label, sub } = EMPTY[filter] || EMPTY.All;
    return (
      <div className="state-center">
        <div className="state-icon"><ListIcon /></div>
        <p className="state-label">{label}</p>
        <p className="state-sub">{sub}</p>
      </div>
    );
  }

  return (
    <div className="task-list" role="list">
      {todos.map((t) => (
        <TodoItem
          key={t._id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

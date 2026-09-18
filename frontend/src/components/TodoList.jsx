import TodoItem from './TodoItem';

const EMPTY = {
  All:    { label: 'No tasks yet',          sub: 'Add something above to get started.' },
  Active: { label: 'All caught up!',        sub: 'No active tasks right now.' },
  Done:   { label: 'Nothing completed yet', sub: 'Finish a task to see it here.' },
};

const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

export default function TodoList({ todos, loading, filter, onToggle, onDelete, onUpdate, onTaskClick }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="spinner" />
        <span className="text-sm text-text3">Loading your tasks...</span>
      </div>
    );
  }

  if (!todos.length) {
    const { label, sub } = EMPTY[filter] || EMPTY.All;
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-text3 opacity-40 mb-1"><ListIcon /></div>
        <p className="text-base font-semibold text-text2">{label}</p>
        <p className="text-sm text-text3">{sub}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3" role="list">
      {todos.map((t) => (
        <TodoItem
          key={t._id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onClick={onTaskClick}
        />
      ))}
    </div>
  );
}

import TodoItem from './TodoItem';

export default function TodoList({ todos, loading, onToggle, onDelete }) {
  if (loading) return <p className="loading">Loading…</p>;

  if (!todos.length) {
    return <p className="empty-state">No tasks here. Add one above!</p>;
  }

  return (
    <div className="todo-list" role="list">
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

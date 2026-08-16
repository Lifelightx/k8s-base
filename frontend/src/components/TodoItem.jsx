export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="todo-item" role="listitem">
      <div
        id={`check-${todo._id}`}
        className={`todo-checkbox ${todo.completed ? 'done' : ''}`}
        role="checkbox"
        aria-checked={todo.completed}
        tabIndex={0}
        onClick={() => onToggle(todo._id)}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(todo._id)}
      />
      <span className={`todo-text ${todo.completed ? 'done' : ''}`}>
        {todo.text}
      </span>
      <button
        id={`delete-${todo._id}`}
        className="btn-delete"
        aria-label="Delete todo"
        onClick={() => onDelete(todo._id)}
      >
        ✕
      </button>
    </div>
  );
}

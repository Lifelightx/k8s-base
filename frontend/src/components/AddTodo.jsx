import { useState } from 'react';

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    await onAdd(trimmed);
    setText('');
    setLoading(false);
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        id="todo-input"
        type="text"
        placeholder="Add a new task…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        autoFocus
      />
      <button
        id="btn-add-todo"
        type="submit"
        className="btn-add"
        disabled={loading || !text.trim()}
      >
        {loading ? '…' : 'Add'}
      </button>
    </form>
  );
}

import { useState, useEffect, useMemo } from 'react';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from './services/api';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (text) => {
    const todo = await createTodo(text);
    setTodos((prev) => [todo, ...prev]);
  };

  const handleToggle = async (id) => {
    const updated = await toggleTodo(id);
    setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const filtered = useMemo(() => {
    if (filter === 'Active') return todos.filter((t) => !t.completed);
    if (filter === 'Done') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo</h1>
        <p>Stay organised, stay focused.</p>
      </header>

      <AddTodo onAdd={handleAdd} />

      <FilterBar current={filter} onChange={setFilter} />

      <TodoList
        todos={filtered}
        loading={loading}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {!loading && todos.length > 0 && (
        <p className="stats">
          {doneCount} of {todos.length} tasks completed
        </p>
      )}
    </div>
  );
}

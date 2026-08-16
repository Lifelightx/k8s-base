const BASE_URL = '/api/todos';

export const fetchTodos = () =>
  fetch(BASE_URL).then((r) => r.json());

export const createTodo = (text) =>
  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then((r) => r.json());

export const toggleTodo = (id) =>
  fetch(`${BASE_URL}/${id}`, { method: 'PATCH' }).then((r) => r.json());

export const deleteTodo = (id) =>
  fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((r) => r.json());

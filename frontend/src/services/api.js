import { getToken } from './auth';

const BASE_URL = '/api/todos';

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
};

/* Attach Bearer token to every request */
const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const fetchTodos = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}${q ? '?' + q : ''}`, {
    headers: authHeaders(),
  }).then(handle);
};

export const fetchStats = () =>
  fetch(`${BASE_URL}/stats`, {
    headers: authHeaders(),
  }).then(handle);

export const createTodo = (text, priority = 'medium') =>
  fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, priority }),
  }).then(handle);

export const toggleTodo = (id) =>
  fetch(`${BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
    headers: authHeaders(),
  }).then(handle);

export const updateTodo = (id, payload) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(handle);

export const deleteTodo = (id) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handle);

export const clearCompleted = () =>
  fetch(`${BASE_URL}/completed`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handle);

import { getToken } from './auth';

const BASE_URL = '/api/todos';

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
};

/* Provide base options with credentials included to send HttpOnly cookies */
const getOptions = (extraHeaders = {}) => {
  return {
    credentials: 'include',
    headers: {
      ...extraHeaders,
    },
  };
};

export const fetchTodos = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}${q ? '?' + q : ''}`, {
    ...getOptions(),
  }).then(handle);
};

export const fetchStats = () =>
  fetch(`${BASE_URL}/stats`, {
    ...getOptions(),
  }).then(handle);

export const fetchTags = () =>
  fetch(`${BASE_URL}/tags`, {
    ...getOptions(),
  }).then(handle);

export const createTodo = (text, priority = 'medium', dueDate = null, remindersEnabled = true, tags = []) =>
  fetch(BASE_URL, {
    method: 'POST',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, priority, dueDate, remindersEnabled, tags }),
  }).then(handle);

export const toggleTodo = (id) =>
  fetch(`${BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
    ...getOptions(),
  }).then(handle);

export const updateTodo = (id, payload) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(handle);

export const deleteTodo = (id) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    ...getOptions(),
  }).then(handle);

export const clearCompleted = () =>
  fetch(`${BASE_URL}/completed`, {
    method: 'DELETE',
    ...getOptions(),
  }).then(handle);

export const planTaskWithAI = (taskName, description) =>
  fetch('/api/ai/plan', {
    method: 'POST',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title: taskName, desc: description }),
  }).then(handle);

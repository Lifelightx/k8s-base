
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

export const createTodo = (text, priority = 'medium', dueDate = null, remindersEnabled = true, tags = [], projectId = null, recurrence = 'none') =>
  fetch(BASE_URL, {
    method: 'POST',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, priority, dueDate, remindersEnabled, tags, projectId, recurrence }),
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

export const fetchProjects = () =>
  fetch('/api/projects', {
    ...getOptions(),
  }).then(handle);

export const createProject = (name, color) =>
  fetch('/api/projects', {
    method: 'POST',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, color }),
  }).then(handle);

export const updateProject = (id, payload) =>
  fetch(`/api/projects/${id}`, {
    method: 'PUT',
    ...getOptions({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(handle);

export const deleteProject = (id) =>
  fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    ...getOptions(),
  }).then(handle);

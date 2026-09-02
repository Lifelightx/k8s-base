const BASE = '/api/auth';

const TOKEN_KEY  = 'nf_token';
const USER_KEY   = 'nf_userId';

/* ── Token helpers ── */
export const getToken   = () => localStorage.getItem(TOKEN_KEY);
export const getUserId  = () => localStorage.getItem(USER_KEY);

const saveSession = ({ token, userId }) => {
  if (token)  localStorage.setItem(TOKEN_KEY, token);
  if (userId) localStorage.setItem(USER_KEY, userId);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/* ── Shared fetch helper ── */
const handle = async (res) => {
  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

/* ── Auth bearer header ── */
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ── API calls ── */
export const authLogin = async (email, password) => {
  const data = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handle);

  // Backend returns { userId, token, ...rest }
  saveSession({ token: data.token, userId: data.userId });
  return data;
};

export const authRegister = async (name, email, password) => {
  const data = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handle);

  saveSession({ token: data.token, userId: data.userId });
  return data;
};

export const authLogout = async () => {
  const token = getToken();
  clearSession();
  if (!token) return;
  return fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  }).catch(() => {}); // best-effort
};

export const authMe = () => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('No token'));
  return fetch(`${BASE}/me`, {
    headers: { ...authHeaders() },
  }).then(handle);
};

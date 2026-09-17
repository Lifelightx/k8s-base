const BASE = '/api/auth';

const USER_KEY   = 'nf_userId';

/* ── Token helpers ── */
export const getUserId  = () => localStorage.getItem(USER_KEY);

const saveSession = ({ userId }) => {
  if (userId) localStorage.setItem(USER_KEY, userId);
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
};

/* ── Shared fetch helper ── */
const handle = async (res) => {
  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

/* ── API calls ── */
export const authLogin = async (email, password) => {
  const data = await fetch(`${BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handle);

  // Backend returns { userId, ...rest } (Token is in HttpOnly cookie)
  saveSession({ userId: data.userId });
  return data;
};

export const authRegister = async (name, email, password) => {
  const data = await fetch(`${BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handle);

  saveSession({ userId: data.userId });
  return data;
};

export const authLogout = async () => {
  clearSession();
  return fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {}); // best-effort
};

export const authMe = () => {
  // We no longer check for a token string. We let the backend reject if the cookie is missing/invalid.
  return fetch(`${BASE}/me`, {
    credentials: 'include',
  }).then(handle);
};

export const authPushSubscribe = (subscription) => {
  return fetch(`${BASE}/push-subscribe`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  }).then(handle).catch(() => {}); // Best effort
};

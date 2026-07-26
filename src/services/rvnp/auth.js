import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('rvnp_token', d.accessToken);
  localStorage.setItem('rvnp_refresh_token', d.refreshToken);
  localStorage.setItem('rvnp_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.accessToken);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.patch('/auth/profile', data);
  return res.data;
}

export async function changePassword(data) {
  const res = await api.patch('/auth/password', data);
  return res.data;
}

export async function logout() {
  localStorage.removeItem('rvnp_token');
  localStorage.removeItem('rvnp_refresh_token');
  localStorage.removeItem('rvnp_admin');
  setAuthToken(null);
}
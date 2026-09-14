import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('smartpos_token', d.accessToken);
  localStorage.setItem('smartpos_refresh_token', d.refreshToken);
  localStorage.setItem('smartpos_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.accessToken);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function changePassword(data) {
  const res = await api.post('/auth/change-password', data);
  return res.data;
}

export async function logout() {
  localStorage.removeItem('smartpos_token');
  localStorage.removeItem('smartpos_refresh_token');
  localStorage.removeItem('smartpos_admin');
  setAuthToken(null);
}
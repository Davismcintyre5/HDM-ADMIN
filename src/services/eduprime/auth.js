import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('eduprime_token', d.token);
  localStorage.setItem('eduprime_refresh_token', d.refreshToken);
  localStorage.setItem('eduprime_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.token);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function logout() {
  localStorage.removeItem('eduprime_token');
  localStorage.removeItem('eduprime_refresh_token');
  localStorage.removeItem('eduprime_admin');
  setAuthToken(null);
}
import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('hdmai2_token', d.token);
  localStorage.setItem('hdmai2_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.token);
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/profile');
  return res.data;
}

export async function logout() {
  localStorage.removeItem('hdmai2_token');
  localStorage.removeItem('hdmai2_admin');
  setAuthToken(null);
}
import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('hdmnet_token', d.accessToken);
  localStorage.setItem('hdmnet_refresh_token', d.refreshToken);
  localStorage.setItem('hdmnet_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.accessToken);
  return res.data;
}

export async function changePassword(data) {
  const res = await api.post('/auth/change-password', data);
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function logout() {
  localStorage.removeItem('hdmnet_token');
  localStorage.removeItem('hdmnet_refresh_token');
  localStorage.removeItem('hdmnet_admin');
  setAuthToken(null);
}
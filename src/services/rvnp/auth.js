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

export async function logout() {
  localStorage.removeItem('rvnp_token');
  localStorage.removeItem('rvnp_refresh_token');
  localStorage.removeItem('rvnp_admin');
  setAuthToken(null);
}
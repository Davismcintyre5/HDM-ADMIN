import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data; 
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data; 
}

export async function registerAdmin(data) {
  const res = await api.post('/auth/register', data);
  return res.data.data;
}
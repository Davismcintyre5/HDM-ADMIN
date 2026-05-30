import api from './api';

export async function login(email, password) {
  const res = await api.post('/login', { email, password });
  return res.data;
}
import api from './api';

export async function adminLogin(email, password) {
  const res = await api.post('/auth/admin/login', { email, password });
  return res.data.data;
}

export async function deleteAccount(password) {
  const res = await api.delete('/auth/account', { data: { password } });
  return res.data;
}
import api from './api';

export async function getStats() {
  const res = await api.get('/admin/stats');
  return res.data.data;
}

export async function getUsage() {
  const res = await api.get('/admin/usage');
  return res.data.data;
}
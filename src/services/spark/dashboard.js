import api from './api';

export async function getStats() {
  const res = await api.get('/dashboard');
  return res.data.data;
}

export async function getActivity(limit = 20) {
  const res = await api.get('/dashboard/activity', { params: { limit } });
  return res.data.data;
}
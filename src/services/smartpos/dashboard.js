import api from './api';

export async function getOverview() {
  const res = await api.get('/dashboard/overview');
  return res.data;
}
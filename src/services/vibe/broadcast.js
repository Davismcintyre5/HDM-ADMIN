import api from './api';

export async function getBroadcasts(params = {}) {
  const res = await api.get('/broadcast', { params });
  return res.data;
}

export async function createBroadcast(data) {
  const res = await api.post('/broadcast', data);
  return res.data;
}
import api from './api';

export async function getBroadcasts() {
  const res = await api.get('/broadcasts');
  return res.data;
}

export async function sendBroadcast(data) {
  const res = await api.post('/broadcasts', data);
  return res.data;
}

export async function previewBroadcast(data) {
  const res = await api.post('/broadcasts/preview', data);
  return res.data;
}
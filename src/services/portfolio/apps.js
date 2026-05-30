import api from './api';

export async function getApps() {
  const res = await api.get('/apps');
  return res.data;
}

export async function createApp(data) {
  const res = await api.post('/apps', data);
  return res.data;
}

export async function updateApp(id, data) {
  const res = await api.put(`/apps/${id}`, data);
  return res.data;
}

export async function deleteApp(id) {
  const res = await api.delete(`/apps/${id}`);
  return res.data;
}
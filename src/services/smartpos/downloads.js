import api from './api';

export async function getDownloads() {
  const res = await api.get('/settings/downloads');
  return res.data;
}

export async function addDownload(payload) {
  const res = await api.post('/settings/downloads', payload);
  return res.data;
}

export async function updateDownload(id, payload) {
  const res = await api.patch(`/settings/downloads/${id}`, payload);
  return res.data;
}

export async function toggleDownload(id) {
  const res = await api.post(`/settings/downloads/${id}/toggle`);
  return res.data;
}

export async function removeDownload(id) {
  const res = await api.delete(`/settings/downloads/${id}`);
  return res.data;
}

export async function reorderDownloads(ids) {
  const res = await api.patch('/settings/downloads/reorder', { ids });
  return res.data;
}
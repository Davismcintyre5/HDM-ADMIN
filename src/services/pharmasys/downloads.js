import api from './api';

export async function getDownloads() {
  const res = await api.get('/downloads');
  return res.data;
}

export async function createDownload(data) {
  const res = await api.post('/downloads', data);
  return res.data;
}

export async function updateDownload(id, data) {
  const res = await api.patch(`/downloads/${id}`, data);
  return res.data;
}

export async function toggleDownload(id) {
  const res = await api.post(`/downloads/${id}/toggle`);
  return res.data;
}

export async function removeDownload(id) {
  const res = await api.delete(`/downloads/${id}`);
  return res.data;
}

export async function reorderDownloads(ids) {
  const res = await api.post('/downloads/reorder', { ids });
  return res.data;
}
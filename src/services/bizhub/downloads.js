import api from './api';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export async function getDownloads(params) {
  const res = await api.get('/downloads', { params });
  return unwrap(res);
}

export async function addDownload(data) {
  const res = await api.post('/downloads', data);
  return unwrap(res);
}

export async function updateDownload(id, data) {
  const res = await api.put(`/downloads/${id}`, data);
  return unwrap(res);
}

export async function toggleDownload(id) {
  const res = await api.put(`/downloads/${id}/toggle`);
  return unwrap(res);
}

export async function removeDownload(id) {
  const res = await api.delete(`/downloads/${id}`);
  return unwrap(res);
}
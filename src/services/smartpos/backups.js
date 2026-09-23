import api from './api';

export async function getBackups(params) {
  const res = await api.get('/backups', { params });
  return res.data;
}

export async function getBackup(id) {
  const res = await api.get(`/backups/${id}`);
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
  return res.data;
}

export async function downloadBackup(id) {
  const res = await api.get(`/backups/${id}/download`);
  const url = res.data?.data?.url || res.data?.url;
  if (!url) throw new Error('No download URL returned');
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}

export async function emailBackup(id, data) {
  const res = await api.post(`/backups/${id}/email`, data);
  return res.data;
}

export async function restoreBackup(id, data) {
  const res = await api.post(`/backups/${id}/restore`, data);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}
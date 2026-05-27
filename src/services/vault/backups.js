import api from './api';

export async function getBackups(params = {}) {
  const res = await api.get('/backups', { params });
  return res.data.data;
}

export async function getLatestBackup() {
  const res = await api.get('/backups/latest');
  return res.data.data;
}

export async function getBackupDetail(id) {
  const res = await api.get(`/backups/${id}`);
  return res.data.data;
}

export async function createBackup(data = { type: 'manual' }) {
  const res = await api.post('/backups', data);
  return res.data;
}

export async function downloadBackup(id) {
  const res = await api.get(`/backups/${id}/download`, { responseType: 'blob' });
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/backups/${id}/restore`);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}
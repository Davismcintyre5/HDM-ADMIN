import api from './api';

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
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
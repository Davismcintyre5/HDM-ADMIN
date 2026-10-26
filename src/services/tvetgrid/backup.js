import api from './api';

export async function getBackupSettings() {
  const res = await api.get('/backup/settings');
  return res.data;
}

export async function updateBackupSettings(data) {
  const res = await api.patch('/backup/settings', data);
  return res.data;
}

export async function createBackupNow() {
  const res = await api.post('/backup/create');
  return res.data;
}

export async function getBackups(params) {
  const res = await api.get('/backup', { params });
  return res.data;
}

export async function getBackup(id) {
  const res = await api.get(`/backup/${id}`);
  return res.data;
}

export async function getBackupDownloadUrl(id) {
  const res = await api.get(`/backup/${id}/download`);
  return res.data;
}

export async function emailBackup(id, { emails, note }) {
  const res = await api.post(`/backup/${id}/email`, { emails, note });
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/backup/${id}/restore`);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backup/${id}`);
  return res.data;
}
import api from './api';

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function getBackupSettings() {
  const res = await api.get('/backups/settings');
  return res.data;
}

export async function updateBackupSettings(data) {
  const res = await api.put('/backups/settings', data);
  return res.data;
}

export async function createBackup(data = { type: 'manual' }) {
  const res = await api.post('/backups', data);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/backups/${id}/restore`);
  return res.data;
}
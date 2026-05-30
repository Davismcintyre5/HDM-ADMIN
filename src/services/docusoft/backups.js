import api from './api';

export async function getBackups() {
  const res = await api.get('/admin/backups');
  return res.data;
}

export async function getBackupSettings() {
  const res = await api.get('/admin/backups/settings');
  return res.data;
}

export async function updateBackupSettings(data) {
  const res = await api.put('/admin/backups/settings', data);
  return res.data;
}

export async function createBackup(data = { type: 'manual' }) {
  const res = await api.post('/admin/backups', data);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/admin/backups/${id}`);
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/admin/backups/${id}/restore`);
  return res.data;
}
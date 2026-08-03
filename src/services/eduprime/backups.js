import api from './api';

export async function getBackups(params) {
  const res = await api.get('/backups', { params });
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

export async function createBackup() {
  const res = await api.post('/backups/create');
  return res.data;
}

export async function uploadBackup(formData) {
  const res = await api.post('/backups/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/backups/${id}/restore`);
  return res.data;
}

export async function emailBackup(id, email) {
  const res = await api.post(`/backups/${id}/email`, { email });
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}
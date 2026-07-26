import api from './api';

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
  return res.data;
}

export async function restoreBackup(formData) {
  const res = await api.post('/backups/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function downloadBackup(id) {
  const res = await api.get(`/backups/${id}/download`);
  return res.data;
}

export async function sendBackupEmail(id, data) {
  const res = await api.post(`/backups/${id}/send-email`, data);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}

export async function getAutoBackupSettings() {
  const res = await api.get('/backups/settings/auto');
  return res.data;
}

export async function updateAutoBackupSettings(data) {
  const res = await api.patch('/backups/settings/auto', data);
  return res.data;
}
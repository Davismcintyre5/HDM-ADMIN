import api from './api';

export async function getBackups(params = {}) {
  const res = await api.get('/backups', { params });
  return res.data.data;
}

export async function getBackupDetail(backupId) {
  const res = await api.get(`/backups/${backupId}`);
  return res.data.data;
}

export async function createBackup(data) {
  const res = await api.post('/backups', data);
  return res.data;
}

export async function deleteBackup(backupId) {
  const res = await api.delete(`/backups/${backupId}`);
  return res.data;
}

export async function restoreBackup(backupId, data) {
  const res = await api.post(`/backups/${backupId}/restore`, data);
  return res.data;
}
import api from './api';

export async function getBackups() {
  const res = await api.get('/admin/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/admin/backups/create');
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/admin/backups/${id}`);
  return res.data;
}

export async function downloadBackup(id) {
  const res = await api.get(`/admin/backups/${id}/download`);
  return res.data;
}
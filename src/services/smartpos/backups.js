import api from './api';

export async function getBackups() {
  const res = await api.get('/system-backups');
  return res.data.data; // { backups }
}

export async function createBackup(data) {
  const res = await api.post('/system-backups', data);
  return res.data.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/system-backups/${id}`);
  return res.data;
}
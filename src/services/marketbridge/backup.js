import api from './api';

export async function createBackup() {
  const res = await api.post('/backup/create');
  return res.data;
}

export async function getBackups() {
  const res = await api.get('/backup/list');
  return res.data;
}

export async function restoreBackup(filename) {
  const res = await api.post('/backup/restore', { filename });
  return res.data;
}
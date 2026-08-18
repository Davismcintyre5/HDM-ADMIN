import api from './api';

const BASE_URL = import.meta.env.VITE_HDMNET_API || 'http://localhost:5000/api/admin';

export async function getBackups(params) {
  const res = await api.get('/backups', { params });
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
  return res.data;
}

export async function getBackup(id) {
  const res = await api.get(`/backups/${id}`);
  return res.data;
}

export async function downloadBackup(id, token) {
  const res = await fetch(`${BASE_URL}/backups/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function sendBackupEmail(id, data) {
  const res = await api.post(`/backups/${id}/send-email`, data);
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
import api from './api';

const BASE_URL = import.meta.env.VITE_SMARTPOS_API || 'http://localhost:5000/api/v1/admin';

export async function getBackups(params) {
  const res = await api.get('/backups', { params });
  return res.data;
}

export async function getBackupStats() {
  const res = await api.get('/backups/stats');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
  return res.data;
}

export async function uploadBackup(formData, mode, token) {
  const res = await fetch(`${BASE_URL}/backups/upload?mode=${mode}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
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
  a.download = `backup-${id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function emailBackup(id, data) {
  const res = await api.post(`/backups/${id}/email`, data);
  return res.data;
}

export async function restoreBackup(id, data) {
  const res = await api.post(`/backups/${id}/restore`, data);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}

export async function cleanupBackups() {
  const res = await api.post('/backups/cleanup');
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
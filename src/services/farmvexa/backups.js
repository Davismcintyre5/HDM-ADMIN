import api from './api';

const BASE_URL = import.meta.env.VITE_FARMVEXA_API || 'http://localhost:5000/api/admin';

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups/create');
  return res.data;
}

export async function uploadBackup(formData, token) {
  const res = await fetch(`${BASE_URL}/backups/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function restoreBackup(id) {
  const res = await api.post(`/backups/${id}/restore`);
  return res.data;
}

export async function downloadBackup(id, filename, token) {
  const res = await fetch(`${BASE_URL}/backups/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function emailBackup(id, email) {
  const res = await api.post(`/backups/${id}/email`, { email });
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
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
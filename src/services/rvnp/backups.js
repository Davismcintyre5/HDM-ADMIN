import api from './api';

const BASE_URL = import.meta.env.VITE_RVNP_API || 'http://localhost:5000/api/admin';

export async function getBackupSettings() {
  const res = await api.get('/backups/settings');
  return res.data;
}

export async function updateBackupSettings(data) {
  const res = await api.put('/backups/settings', data);
  return res.data;
}

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups');
  return res.data;
}

export async function downloadBackup(filename, token) {
  const res = await fetch(`${BASE_URL}/backups/download/${filename}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function sendBackupEmail(filename, data) {
  const res = await api.post(`/backups/send-email/${filename}`, data);
  return res.data;
}

export async function deleteBackup(filename) {
  const res = await api.delete(`/backups/${filename}`);
  return res.data;
}

export async function uploadRestore(formData, token) {
  const res = await fetch(`${BASE_URL}/backups/upload-restore`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}
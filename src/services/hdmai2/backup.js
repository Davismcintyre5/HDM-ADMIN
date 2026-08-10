import api from './api';

const BASE_URL = import.meta.env.VITE_HDMAI2_API || 'http://localhost:5000/api/admin';

export async function getBackups() {
  const res = await api.get('/backup');
  return res.data;
}

export async function createBackup(type = 'full') {
  const res = await api.post('/backup', { type });
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backup/${id}`);
  return res.data;
}

export async function downloadBackup(id, filename, token) {
  const res = await fetch(`${BASE_URL}/backup/${id}/download`, {
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
  const res = await api.post(`/backup/${id}/email`, { email });
  return res.data;
}

export async function restoreBackup(formData, token) {
  const res = await fetch(`${BASE_URL}/backup/restore`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}
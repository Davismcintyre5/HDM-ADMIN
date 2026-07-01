import api from './api';

export async function getBackupConfig() {
  const res = await api.get('/backups/config');
  return res.data;
}

export async function updateBackupConfig(data) {
  const res = await api.put('/backups/config', data);
  return res.data;
}

export async function getBackups() {
  const res = await api.get('/backups');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups/create');
  return res.data;
}

export async function downloadBackup(filename) {
  const token = localStorage.getItem('farmwise_token');
  const response = await fetch(`${api.defaults.baseURL}/backups/${filename}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return { success: true };
}

export async function emailBackup(filename, email) {
  const res = await api.post(`/backups/${filename}/email`, { email });
  return res.data;
}

export async function restoreBackup(filename) {
  const res = await api.post(`/backups/${filename}/restore`);
  return res.data;
}

export async function deleteBackup(filename) {
  const res = await api.delete(`/backups/${filename}`);
  return res.data;
}

export async function uploadBackup(file) {
  const formData = new FormData();
  formData.append('backup', file);
  const res = await api.post('/backups/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
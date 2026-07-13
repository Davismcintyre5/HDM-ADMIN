import api from './api';

export async function getBackups(params) {
  const res = await api.get('/backups', { params });
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

export async function createBackup(data) {
  const res = await api.post('/backups/create', data);
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

export async function restoreBackup(id) {
  const res = await api.put(`/backups/${id}/restore`);
  return res.data;
}

export async function downloadBackup(id) {
  const token = localStorage.getItem('bizhub_token');
  const response = await fetch(`${api.defaults.baseURL}/backups/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return { success: true };
}

export async function emailBackup(id, email) {
  const res = await api.post(`/backups/${id}/email`, { email });
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}
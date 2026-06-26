import api from './api';

export async function getBackups(params = {}) {
  const res = await api.get('/backups', { params });
  return res.data;
}

export async function getBackupStatus() {
  const res = await api.get('/backups/status');
  return res.data;
}

export async function createBackup() {
  const res = await api.post('/backups/now');
  return res.data;
}

export async function updateBackupSettings(data) {
  const res = await api.put('/backups/settings', data);
  return res.data;
}

export async function downloadBackup(id) {
  const token = localStorage.getItem('flax_token');
  const response = await fetch(`${api.defaults.baseURL}/backups/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Download failed');
  const disposition = response.headers.get('Content-Disposition');
  let filename = 'backup.json';
  if (disposition) {
    const match = disposition.match(/filename="?(.+?)"?$/);
    if (match) filename = match[1];
  }
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

export async function emailBackup(id, email) {
  const res = await api.post(`/backups/${id}/send-email`, email ? { email } : {});
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
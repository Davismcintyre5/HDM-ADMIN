import api from './api';

export async function getBackupSettings() { const res = await api.get('/backups/settings'); return res.data.data; }
export async function updateBackupSettings(data) { const res = await api.put('/backups/settings', data); return res.data.data; }
export async function getBackupHistory() { const res = await api.get('/backups/history'); return res.data.data; }
export async function runBackup() { const res = await api.post('/backups/run'); return res.data; }
export async function deleteBackup(id) { const res = await api.delete(`/backups/${id}`); return res.data; }
export async function downloadBackup(filename) {
  const res = await api.get(`/backups/download/${filename}`, { responseType: 'blob' });
  return res.data;
}
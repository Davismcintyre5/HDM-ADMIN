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

export async function createBackup(data = { type: 'manual' }) {
  const res = await api.post('/backups', data);
  return res.data;
}

export async function uploadBackup(formData) {
  const res = await api.post('/backups/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function sendBackupEmail(id, email) {
  const res = await api.post(`/backups/${id}/send`, { email });
  return res.data;
}

export async function cleanupBackups() {
  const res = await api.post('/backups/cleanup');
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

export async function downloadBackup(id) {
  const token = localStorage.getItem('portfolio_token');
  const baseUrl =
    import.meta.env.VITE_PORTFOLIO_API ||
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/hdm/api/admin`;
  const url = `${baseUrl}/backups/${id}/download`;

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `backup-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // Fallback: open the URL directly (backend may 302-redirect to Cloudinary)
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
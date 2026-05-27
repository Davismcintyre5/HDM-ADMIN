import api from './api';

export async function getAuditLogs(params = {}) {
  const res = await api.get('/audit', { params });
  return res.data.data;
}

export async function exportAuditLogs() {
  const res = await api.get('/audit/export', { responseType: 'blob' });
  return res.data;
}
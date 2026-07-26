import api from './api';

export async function getAuditLogs(params) {
  const res = await api.get('/audit-logs', { params });
  return res.data;
}
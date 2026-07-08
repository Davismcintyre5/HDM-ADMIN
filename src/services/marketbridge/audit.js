import api from './api';

export async function getAuditLogs(params = {}) {
  const res = await api.get('/audit', { params });
  return res.data;
}
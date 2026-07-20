import api from './api';

export async function getAuditLogs(params) {
  const res = await api.get('/audit-logs', { params });
  return res.data;
}

export async function getAuditLog(id) {
  const res = await api.get(`/audit-logs/${id}`);
  return res.data;
}
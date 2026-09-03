import api from './api';

export async function getAuditLogs(params) {
  const res = await api.get('/audit-logs', { params });
  return res.data;
}

export async function getAdminLogs(adminId) {
  const res = await api.get(`/audit-logs/admin/${adminId}`);
  return res.data;
}
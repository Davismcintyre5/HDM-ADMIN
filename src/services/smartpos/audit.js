import api from './api';

export async function getAuditLogs(params) {
  const res = await api.get('/audit', { params });
  return res.data;
}

export async function getAuditByClient(clientId, params) {
  const res = await api.get(`/audit/tenant/${clientId}`, { params });
  return res.data;
}
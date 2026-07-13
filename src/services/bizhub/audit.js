import api from './api';

export async function getAuditLogs(params) {
  const res = await api.get('/audit', { params });
  return res.data;
}

export async function getAuditActions() {
  const res = await api.get('/audit/actions');
  return res.data;
}

export async function getAuditModules() {
  const res = await api.get('/audit/modules');
  return res.data;
}

export async function getTenantAuditLogs(tenantId) {
  const res = await api.get(`/audit/tenant/${tenantId}`);
  return res.data;
}

export async function getAuditLog(id) {
  const res = await api.get(`/audit/${id}`);
  return res.data;
}
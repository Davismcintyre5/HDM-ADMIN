import api from './api';

export async function getApprovals(params) {
  const res = await api.get('/approvals', { params });
  return res.data;
}

export async function approveApproval(id, data) {
  const res = await api.put(`/approvals/${id}/approve`, data);
  return res.data;
}

export async function rejectApproval(id, reason) {
  const res = await api.put(`/approvals/${id}/reject`, { reason });
  return res.data;
}

export async function bulkApprove(ids, plan) {
  const res = await api.post('/approvals/bulk-approve', { ids, plan });
  return res.data;
}

export async function getNewApprovals(params) {
  const res = await api.get('/approvals/new', { params });
  return res.data;
}

export async function getRenewals(params) {
  const res = await api.get('/approvals/renewals', { params });
  return res.data;
}
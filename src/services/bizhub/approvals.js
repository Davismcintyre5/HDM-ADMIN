import api from './api';

export async function getApprovals(params) {
  const res = await api.get('/approvals', { params });
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

export async function getUpgrades(params) {
  const res = await api.get('/approvals/upgrades', { params });
  return res.data;
}

export async function getApprovalStats() {
  const res = await api.get('/approvals/stats');
  return res.data;
}

export async function approveApproval(id, data = {}) {
  const res = await api.put(`/approvals/${id}/approve`, data);
  return res.data;
}

export async function rejectApproval(id, reason) {
  const res = await api.put(`/approvals/${id}/reject`, { reason });
  return res.data;
}

export async function confirmPayment(id) {
  const res = await api.put(`/approvals/${id}/confirm-payment`);
  return res.data;
}

export async function deleteApproval(id) {
  const res = await api.delete(`/approvals/${id}`);
  return res.data;
}

export async function bulkApprove(ids) {
  const res = await api.post('/approvals/bulk-approve', { ids });
  return res.data;
}
import api from './api';

export async function getPendingApprovals(params) {
  const res = await api.get('/approvals/pending', { params });
  return res.data;
}

export async function getApprovalHistory(params) {
  const res = await api.get('/approvals/history', { params });
  return res.data;
}

export async function approveUser(id, data) {
  const res = await api.put(`/approvals/${id}/approve`, data);
  return res.data;
}

export async function rejectUser(id, data) {
  const res = await api.put(`/approvals/${id}/reject`, data);
  return res.data;
}
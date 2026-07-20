import api from './api';

export async function getApprovals(params) {
  const res = await api.get('/approvals', { params });
  return res.data;
}

export async function getApproval(id) {
  const res = await api.get(`/approvals/${id}`);
  return res.data;
}

export async function approveApproval(id) {
  const res = await api.patch(`/approvals/${id}/approve`);
  return res.data;
}

export async function rejectApproval(id, reason) {
  const res = await api.patch(`/approvals/${id}/reject`, { reason });
  return res.data;
}

export async function deleteApproval(id) {
  const res = await api.delete(`/approvals/${id}`);
  return res.data;
}
import api from './api';

export async function getApprovals(params = {}) {
  const res = await api.get('/approvals', { params });
  return res.data.data;
}

export async function getApproval(id) {
  const res = await api.get(`/approvals/${id}`);
  return res.data.data;
}

export async function approveActivation(id) {
  const res = await api.post(`/approvals/${id}/approve`);
  return res.data;
}

export async function rejectActivation(id, reason) {
  const res = await api.post(`/approvals/${id}/reject`, { reason });
  return res.data;
}

export async function verifyPayment(id, data) {
  const res = await api.put(`/approvals/${id}/verify`, data);
  return res.data;
}
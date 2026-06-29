import api from './api';

export async function getApprovals() {
  const res = await api.get('/approvals');
  return res.data.data;
}

export async function approvePayment(id, type = 'activation') {
  const res = await api.put(`/approvals/${id}/approve`, { type });
  return res.data.data || res.data;
}

export async function rejectPayment(id, reason, type = 'activation') {
  const res = await api.put(`/approvals/${id}/reject`, { reason, type });
  return res.data.data || res.data;
}

export async function deleteApproval(id, type = 'activation') {
  const res = await api.delete(`/approvals/${id}`, { params: { type } });
  return res.data;
}
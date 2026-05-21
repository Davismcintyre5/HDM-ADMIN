import api from './api';

export async function getApprovals() { const res = await api.get('/approvals'); return res.data.data; }
export async function approvePayment(id) { const res = await api.put(`/approvals/${id}/approve`); return res.data.data || res.data; }
export async function rejectPayment(id, reason) { const res = await api.put(`/approvals/${id}/reject`, { reason }); return res.data.data || res.data; }
export async function deleteApproval(id) { const res = await api.delete(`/approvals/${id}`); return res.data; }
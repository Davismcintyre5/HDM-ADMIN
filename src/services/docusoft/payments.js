import api from './api';

export async function getPendingPayments() {
  const res = await api.get('/admin/payments/pending');
  return res.data;
}

export async function approvePayment(id) {
  const res = await api.put(`/admin/payments/${id}/approve`);
  return res.data;
}

export async function rejectPayment(id, reason) {
  const res = await api.put(`/admin/payments/${id}/reject`, { reason });
  return res.data;
}
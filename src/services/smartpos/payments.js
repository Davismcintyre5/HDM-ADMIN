import api from './api';

export async function getPendingPayments() {
  const res = await api.get('/payments/pending');
  return res.data.data;
}

export async function getAllPayments() {
  const res = await api.get('/payments');
  return res.data.data;
}

export async function approvePayment(id) {
  const res = await api.put(`/payments/${id}/approve`, { auto: false });
  return res.data;
}

export async function rejectPayment(id, reason) {
  const res = await api.put(`/payments/${id}/reject`, { reason });
  return res.data;
}

export async function deletePayment(id) {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
}

export async function deleteAllApproved() {
  const res = await api.delete('/payments/approved');
  return res.data;
}

export async function deleteAllRejected() {
  const res = await api.delete('/payments/rejected');
  return res.data;
}
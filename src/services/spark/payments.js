import api from './api';

export async function getActivations(params = {}) {
  const res = await api.get('/payments/activations', { params });
  return res.data.data; // { activations, total, page, limit, totalPages }
}

export async function approveActivation(activationId) {
  const res = await api.patch(`/payments/activations/${activationId}/approve`);
  return res.data;
}

export async function rejectActivation(activationId, reason) {
  const res = await api.patch(`/payments/activations/${activationId}/reject`, { reason });
  return res.data;
}

export async function revokeVerification(userId, reason) {
  const res = await api.post(`/payments/revoke/${userId}`, { reason });
  return res.data;
}

export async function getPaymentStats() {
  const res = await api.get('/payments/stats');
  return res.data.data;
}

export async function getAllPayments(params = {}) {
  const res = await api.get('/payments', { params });
  return res.data;
}
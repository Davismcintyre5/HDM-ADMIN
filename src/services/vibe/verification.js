import api from './api';

export async function getPendingVerifications(params = {}) {
  const res = await api.get('/verification/pending', { params });
  return res.data;
}

export async function getAllVerifications(params = {}) {
  const res = await api.get('/verification', { params });
  return res.data;
}

export async function approveVerification(id) {
  const res = await api.put(`/verification/${id}/approve`);
  return res.data;
}

export async function rejectVerification(id, reason) {
  const res = await api.put(`/verification/${id}/reject`, { reason });
  return res.data;
}
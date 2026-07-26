import api from './api';

export async function getVerificationQueue() {
  const res = await api.get('/verification-queue');
  return res.data;
}

export async function approveVerification(id) {
  const res = await api.post(`/verification-queue/${id}/approve`);
  return res.data;
}

export async function rejectVerification(id, data) {
  const res = await api.post(`/verification-queue/${id}/reject`, data);
  return res.data;
}
import api from './api';

export async function getPendingActivations(params) {
  const res = await api.get('/pending-activations', { params });
  return res.data;
}

export async function approveActivation(id) {
  const res = await api.put(`/pending-activations/${id}/approve`);
  return res.data;
}

export async function rejectActivation(id, data) {
  const res = await api.put(`/pending-activations/${id}/reject`, data);
  return res.data;
}
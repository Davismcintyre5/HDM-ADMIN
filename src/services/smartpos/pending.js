import api from './api';

export async function getPendingList(params) {
  const res = await api.get('/pending', { params });
  return res.data;
}

export async function getPending(id) {
  const res = await api.get(`/pending/${id}`);
  return res.data;
}

export async function approvePending(id, data) {
  const res = await api.post(`/pending/${id}/approve`, data);
  return res.data;
}

export async function rejectPending(id, data) {
  const res = await api.post(`/pending/${id}/reject`, data);
  return res.data;
}

export async function confirmPayment(id, data) {
  const res = await api.post(`/pending/${id}/confirm-payment`, data);
  return res.data;
}

export async function addPendingNotes(id, notes) {
  const res = await api.post(`/pending/${id}/notes`, { notes });
  return res.data;
}
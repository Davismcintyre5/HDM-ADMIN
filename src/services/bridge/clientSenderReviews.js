import api from './api';

export async function listClientSendersForReview(params = {}) {
  const res = await api.get('/senders/client-review', { params });
  return res.data;
}

export async function approveClientSender(id, data = {}) {
  const res = await api.put(`/senders/client-review/${id}/approve`, data);
  return res.data;
}

export async function rejectClientSender(id, reason) {
  const res = await api.put(`/senders/client-review/${id}/reject`, { reason });
  return res.data;
}
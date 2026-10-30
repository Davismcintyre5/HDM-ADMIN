import api from './api';

export async function listClientSendersForReview(params = {}) {
  const res = await api.get('/senders/client-review', { params });
  return res.data;
}

export async function approveClientSender(id) {
  const res = await api.put(`/senders/client-review/${id}/approve`);
  return res.data;
}

export async function rejectClientSender(id, reason) {
  const res = await api.put(`/senders/client-review/${id}/reject`, { reason });
  return res.data;
}
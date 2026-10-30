import api from './api';

export async function getSenders(params = {}) {
  const res = await api.get('/senders', { params });
  return res.data;
}
export async function getSender(id) {
  const res = await api.get(`/senders/${id}`);
  return res.data;
}
export async function createSender(data) {
  const res = await api.post('/senders', data);
  return res.data;
}
export async function updateSender(id, data) {
  const res = await api.put(`/senders/${id}`, data);
  return res.data;
}
export async function approveSender(id) {
  const res = await api.put(`/senders/${id}/approve`);
  return res.data;
}
export async function rejectSender(id, reason) {
  const res = await api.put(`/senders/${id}/reject`, { reason });
  return res.data;
}
export async function setDefaultSender(id) {
  const res = await api.put(`/senders/${id}/default`);
  return res.data;
}
export async function deleteSender(id) {
  const res = await api.delete(`/senders/${id}`);
  return res.data;
}
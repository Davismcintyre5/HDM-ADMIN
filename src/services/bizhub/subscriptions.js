import api from './api';

export async function getSubscriptions(params = {}) {
  const res = await api.get('/subscriptions', { params });
  return res.data;
}

export async function getSubscription(id) {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data;
}

export async function approveSubscription(id) {
  const res = await api.patch(`/subscriptions/${id}/approve`);
  return res.data;
}

export async function rejectSubscription(id) {
  const res = await api.patch(`/subscriptions/${id}/reject`);
  return res.data;
}

export async function cancelSubscription(id) {
  const res = await api.patch(`/subscriptions/${id}/cancel`);
  return res.data;
}

export async function deleteSubscription(id) {
  const res = await api.delete(`/subscriptions/${id}`);
  return res.data;
}

export async function addManualSubscription(data) {
  const res = await api.post('/subscriptions/manual', data);
  return res.data;
}
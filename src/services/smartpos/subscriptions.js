import api from './api';

export async function getSubscriptions(params) {
  const res = await api.get('/subscriptions', { params });
  return res.data;
}

export async function getRenewals() {
  const res = await api.get('/subscriptions/renewals');
  return res.data;
}

export async function getSubscription(id) {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data;
}

export async function getSubscriptionHistory(id) {
  const res = await api.get(`/subscriptions/${id}/history`);
  return res.data;
}

export async function extendSubscription(id, data) {
  const res = await api.post(`/subscriptions/${id}/extend`, data);
  return res.data;
}

export async function renewSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/renew`);
  return res.data;
}

export async function suspendSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/suspend`);
  return res.data;
}

export async function expireSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/expire`);
  return res.data;
}
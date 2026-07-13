import api from './api';

export async function getOrders(params = {}) {
  const res = await api.get('/orders', { params });
  return res.data;
}

export async function getOrder(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function receiveOrder(id) {
  const res = await api.put(`/orders/${id}/receive`);
  return res.data;
}

export async function qualityCheckOrder(id, data) {
  const res = await api.put(`/orders/${id}/quality-check`, data);
  return res.data;
}

export async function dispatchOrder(id, data) {
  const res = await api.put(`/orders/${id}/dispatch`, data);
  return res.data;
}

export async function deliverOrder(id) {
  const res = await api.put(`/orders/${id}/deliver`);
  return res.data;
}

export async function releasePayout(id) {
  const res = await api.put(`/orders/${id}/release-payout`);
  return res.data;
}

export async function getPayoutsList() {
  const res = await api.get('/orders/payouts/list');
  return res.data;
}

export async function bulkReceive(ids) {
  const res = await api.put('/orders/bulk/receive', { ids });
  return res.data;
}
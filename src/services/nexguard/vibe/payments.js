import api from './api';

export async function getPaymentSettings() {
  const res = await api.get('/payments/settings');
  return res.data;
}

export async function getPaymentSettingsAll() {
  const res = await api.get('/payments/settings/all');
  return res.data;
}

export async function updatePaymentSettings(data) {
  const res = await api.put('/payments/settings', data);
  return res.data;
}

export async function togglePaymentMethod(method, data) {
  const res = await api.put(`/payments/settings/${method}`, data);
  return res.data;
}

export async function getTransactions(params = {}) {
  const res = await api.get('/payments/transactions', { params });
  return res.data;
}

export async function getPaymentAnalytics() {
  const res = await api.get('/payments/analytics');
  return res.data;
}
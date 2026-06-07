import api from './api';

export async function getSettings() {
  const res = await api.get('/system');
  return res.data;
}

export async function updateSetting(data) {
  const res = await api.put('/system', data);
  return res.data;
}

export async function bulkUpdateSettings(data) {
  const res = await api.put('/system/bulk', data);
  return res.data;
}

export async function getPaymentMethods() {
  const res = await api.get('/system/payment-methods');
  return res.data;
}

export async function updatePaymentMethod(id, data) {
  const res = await api.put(`/system/payment-methods/${id}`, data);
  return res.data;
}

export async function togglePaymentMethod(id) {
  const res = await api.put(`/system/payment-methods/${id}/toggle`);
  return res.data;
}

export async function getSystemHealth() {
  const res = await api.get('/system/health');
  return res.data;
}
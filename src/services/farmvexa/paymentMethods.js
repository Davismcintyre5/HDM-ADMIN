import api from './api';

function normalizeMethodPayload(data = {}) {
  const out = { ...data };

  if (out.type && !out.code) out.code = out.type;
  if (out.name && !out.label) out.label = out.name;
  if (out.details && !out.config) out.config = out.details;

  delete out.type;
  delete out.name;
  delete out.details;
  delete out.isDefault;
  delete out._id;
  delete out.id;
  delete out.__v;

  if (!out.mode && out.code) {
    out.mode = out.code === 'mpesa_stk' || out.code === 'stripe' ? 'auto' : 'manual';
  }

  return out;
}

export async function getPaymentMethods() {
  const res = await api.get('/payment-methods');
  return res.data;
}

export async function createPaymentMethod(data) {
  const res = await api.post('/payment-methods', normalizeMethodPayload(data));
  return res.data;
}

export async function updatePaymentMethod(id, data) {
  const res = await api.put(`/payment-methods/${id}`, normalizeMethodPayload(data));
  return res.data;
}

export async function togglePaymentMethod(id) {
  const res = await api.put(`/payment-methods/${id}/toggle`);
  return res.data;
}

export async function deletePaymentMethod(id) {
  const res = await api.delete(`/payment-methods/${id}`);
  return res.data;
}
import api from './api';

export async function sendToUser(data) {
  const res = await api.post('/communication/user', data);
  return res.data;
}

export async function sendToAll(data) {
  const res = await api.post('/communication/all', data);
  return res.data;
}

export async function sendToModule(data) {
  const res = await api.post('/communication/module', data);
  return res.data;
}

export async function sendToModuleSpecific(data) {
  const res = await api.post('/communication/module-specific', data);
  return res.data;
}

export async function sendCustom(data) {
  const res = await api.post('/communication/custom', data);
  return res.data;
}

export async function getTenantUsers(tenantId) {
  const res = await api.get(`/communication/tenants/${tenantId}/users`);
  return res.data;
}
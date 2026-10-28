import { get, post, patch, del } from './api';

/* ---------------- Pending providers ---------------- */

export async function getPendingProviders(params = {}) {
  const { data, meta } = await get('/providers/pending', { params });
  return { data: data || [], meta };
}

export async function getPendingProvider(id) {
  const { data } = await get(`/providers/pending/${id}`);
  return data;
}

export async function approvePendingProvider(id) {
  const { data } = await post(`/providers/pending/${id}/approve`);
  return data;
}

export async function rejectPendingProvider(id, reason) {
  const { data } = await post(`/providers/pending/${id}/reject`, { reason });
  return data;
}

export async function deletePendingProvider(id) {
  const { data } = await del(`/providers/pending/${id}`);
  return data;
}

export async function expireStalePendingProviders() {
  const { data } = await post('/providers/pending/expire-stale');
  return data;
}

/* ---------------- Active providers ---------------- */

export async function getProviders(params = {}) {
  const { data, meta } = await get('/providers', { params });
  return { data: data || [], meta };
}

export async function getProvider(id) {
  const { data } = await get(`/providers/${id}`);
  return data;
}

export async function createProvider(payload) {
  const { data } = await post('/providers', payload);
  return data;
}

export async function updateProvider(id, payload) {
  const { data } = await patch(`/providers/${id}`, payload);
  return data;
}

export async function suspendProvider(id, reason) {
  const { data } = await post(`/providers/${id}/suspend`, { reason });
  return data;
}

export async function activateProvider(id) {
  const { data } = await post(`/providers/${id}/activate`);
  return data;
}

export async function approveProviderSubscription(id) {
  const { data } = await post(`/providers/${id}/approve`);
  return data;
}

export async function rejectProvider(id, reason) {
  const { data } = await post(`/providers/${id}/reject`, { reason });
  return data;
}

export async function deleteProvider(id) {
  const { data } = await del(`/providers/${id}`);
  return data;
}
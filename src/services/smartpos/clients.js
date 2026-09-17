import api from './api';

export async function getClients(params) {
  const res = await api.get('/clients', { params });
  return res.data;
}

export async function getClient(id) {
  const res = await api.get(`/clients/${id}`);
  return res.data;
}

export async function getPendingApprovals() {
  const res = await api.get('/clients/pending');
  return res.data;
}

export async function createClient(data) {
  const res = await api.post('/clients', data);
  return res.data;
}

export async function approveClient(id) {
  const res = await api.post(`/clients/${id}/approve`);
  return res.data;
}

export async function rejectClient(id, data) {
  const res = await api.post(`/clients/${id}/reject`, data);
  return res.data;
}

export async function suspendClient(id, data) {
  const res = await api.post(`/clients/${id}/suspend`, data);
  return res.data;
}

export async function restoreClient(id) {
  const res = await api.post(`/clients/${id}/restore`);
  return res.data;
}

export async function extendTrial(id, data) {
  const res = await api.post(`/clients/${id}/extend-trial`, data);
  return res.data;
}

export async function issueEnt(id) {
  const res = await api.post(`/clients/${id}/issue-ent`);
  return res.data;
}

export async function revokeEnt(id) {
  const res = await api.post(`/clients/${id}/revoke-ent`);
  return res.data;
}

export async function impersonateClient(id) {
  const res = await api.post(`/clients/${id}/impersonate`);
  return res.data;
}

export async function deleteClient(id) {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
}
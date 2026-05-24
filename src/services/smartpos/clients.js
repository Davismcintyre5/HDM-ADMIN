import api from './api';

export async function getClients(params = {}) {
  const res = await api.get('/clients', { params });
  return res.data.data; // { clients, count, page, pages }
}

export async function getClient(id) {
  const res = await api.get(`/clients/${id}`);
  return res.data.data; // { client }
}

export async function updateClient(id, data) {
  const res = await api.put(`/clients/${id}`, data);
  return res.data.data;
}

export async function suspendClient(id) {
  const res = await api.put(`/clients/${id}/suspend`);
  return res.data;
}

export async function activateClient(id) {
  const res = await api.put(`/clients/${id}/activate`);
  return res.data;
}

export async function deleteClient(id) {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
}
import api from './api';

export async function getServices() {
  const res = await api.get('/services');
  return res.data;
}

export async function createService(data) {
  const res = await api.post('/services', data);
  return res.data;
}

export async function updateService(id, data) {
  const res = await api.put(`/services/${id}`, data);
  return res.data;
}

export async function deleteService(id) {
  const res = await api.delete(`/services/${id}`);
  return res.data;
}
import api from './api';

export async function getModels() {
  const res = await api.get('/models');
  return res.data;
}

export async function getModel(id) {
  const res = await api.get(`/models/${id}`);
  return res.data;
}

export async function createModel(data) {
  const res = await api.post('/models', data);
  return res.data;
}

export async function updateModel(id, data) {
  const res = await api.put(`/models/${id}`, data);
  return res.data;
}

export async function trainModel(id) {
  const res = await api.post(`/models/${id}/train`);
  return res.data;
}

export async function deployModel(id) {
  const res = await api.post(`/models/${id}/deploy`);
  return res.data;
}

export async function deleteModel(id) {
  const res = await api.delete(`/models/${id}`);
  return res.data;
}
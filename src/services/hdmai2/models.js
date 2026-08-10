import api from './api';

export async function getModels() {
  const res = await api.get('/models');
  return res.data;
}

export async function getModelInfo() {
  const res = await api.get('/models/info');
  return res.data;
}

export async function createModel(data) {
  const res = await api.post('/models', data);
  return res.data;
}

export async function archiveModel(id) {
  const res = await api.put(`/models/${id}/archive`);
  return res.data;
}

export async function deleteModel(id) {
  const res = await api.delete(`/models/${id}`);
  return res.data;
}
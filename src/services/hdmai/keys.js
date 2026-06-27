import api from './api';

export async function getAIKeys() {
  const res = await api.get('/keys/ai');
  return res.data;
}

export async function saveAIKey(data) {
  const res = await api.put('/keys/ai', data);
  return res.data;
}

export async function deleteAIKey(id) {
  const res = await api.delete(`/keys/ai/${id}`);
  return res.data;
}

export async function getProjectKeys(params = {}) {
  const res = await api.get('/keys/project', { params });
  return res.data;
}

export async function revokeProjectKey(id) {
  const res = await api.delete(`/keys/project/${id}`);
  return res.data;
}

export async function createProjectKey(data) {
  const res = await api.post('/keys/project', data);
  return res.data;
}
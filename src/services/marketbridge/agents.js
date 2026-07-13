import api from './api';

export async function getAgents() {
  const res = await api.get('/agents');
  return res.data;
}

export async function createAgent(data) {
  const res = await api.post('/agents', data);
  return res.data;
}

export async function updateAgent(id, data) {
  const res = await api.put(`/agents/${id}`, data);
  return res.data;
}

export async function deactivateAgent(id) {
  const res = await api.delete(`/agents/${id}`);
  return res.data;
}

export async function permanentDeleteAgent(id) {
  const res = await api.delete(`/agents/${id}/permanent`);
  return res.data;
}
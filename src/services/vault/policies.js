import api from './api';

export async function getPolicies() {
  const res = await api.get('/policies');
  return res.data.data;
}

export async function updatePolicies(data) {
  const res = await api.put('/policies', data);
  return res.data;
}
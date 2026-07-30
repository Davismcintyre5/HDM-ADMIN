import api from './api';

export async function getSupport() {
  const res = await api.get('/support');
  return res.data;
}

export async function updateSupport(data) {
  const res = await api.put('/support', data);
  return res.data;
}
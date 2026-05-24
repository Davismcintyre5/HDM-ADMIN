import api from './api';

export async function getSystem() {
  const res = await api.get('/system');
  return res.data.data; // { settings }
}

export async function updateSystem(data) {
  const res = await api.put('/system', data);
  return res.data.data;
}
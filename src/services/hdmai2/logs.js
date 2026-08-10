import api from './api';

export async function getLogs(params) {
  const res = await api.get('/logs', { params });
  return res.data;
}

export async function clearLogs(data) {
  const res = await api.delete('/logs', { data });
  return res.data;
}
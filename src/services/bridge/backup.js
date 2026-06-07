import api from './api';

export async function getBackups() {
  const res = await api.get('/backup');
  return res.data;
}

export async function getBackup(id) {
  const res = await api.get(`/backup/${id}`);
  return res.data;
}

export async function createBackup(data = { type: 'database' }) {
  const res = await api.post('/backup', data);
  return res.data;
}

export async function restoreBackup(id) {
  const res = await api.post(`/backup/${id}/restore`);
  return res.data;
}

export async function deleteBackup(id) {
  const res = await api.delete(`/backup/${id}`);
  return res.data;
}

export async function getSchedules() {
  const res = await api.get('/backup/schedules/all');
  return res.data;
}

export async function createSchedule(data) {
  const res = await api.post('/backup/schedules', data);
  return res.data;
}
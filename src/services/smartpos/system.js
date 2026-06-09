import api from './api';

export async function getSystem() {
  const res = await api.get('/system');
  return res.data;
}

export async function updateSystem(data) {
  const res = await api.put('/system', data);
  return res.data;
}

export async function enableMaintenance({ reason, durationHours, message }) {
  const res = await api.post('/system/maintenance/enable', { reason, durationHours, message });
  return res.data;
}

export async function disableMaintenance({ sendCompletionEmail = true }) {
  const res = await api.post('/system/maintenance/disable', { sendCompletionEmail });
  return res.data;
}
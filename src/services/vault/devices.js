import api from './api';

export async function getDevices(params = {}) {
  const res = await api.get('/devices', { params });
  return res.data.data;
}

export async function lockDevice(id) {
  const res = await api.put(`/devices/${id}/lock`);
  return res.data;
}

export async function unlockDevice(id) {
  const res = await api.put(`/devices/${id}/unlock`);
  return res.data;
}

export async function deleteDevice(id) {
  const res = await api.delete(`/devices/${id}`);
  return res.data;
}
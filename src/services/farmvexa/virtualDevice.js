import api from './api';

export async function getVirtualDeviceSettings() {
  const res = await api.get('/virtual-device/settings');
  return res.data;
}

export async function updateVirtualDeviceSettings(data) {
  const res = await api.put('/virtual-device/settings', data);
  return res.data;
}

export async function getVirtualDevices() {
  const res = await api.get('/virtual-device/devices');
  return res.data;
}
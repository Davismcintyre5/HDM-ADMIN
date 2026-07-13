import api from './api';

// Zones
export async function getShippingZones() {
  const res = await api.get('/shipping/zones');
  return res.data;
}

export async function createShippingZone(data) {
  const res = await api.post('/shipping/zones', data);
  return res.data;
}

export async function updateShippingZone(id, data) {
  const res = await api.put(`/shipping/zones/${id}`, data);
  return res.data;
}

export async function deleteShippingZone(id) {
  const res = await api.delete(`/shipping/zones/${id}`);
  return res.data;
}

// Pickup Points
export async function getPickupPoints() {
  const res = await api.get('/shipping/pickups');
  return res.data;
}

export async function createPickupPoint(data) {
  const res = await api.post('/shipping/pickups', data);
  return res.data;
}

export async function updatePickupPoint(id, data) {
  const res = await api.put(`/shipping/pickups/${id}`, data);
  return res.data;
}

export async function deletePickupPoint(id) {
  const res = await api.delete(`/shipping/pickups/${id}`);
  return res.data;
}
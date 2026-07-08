import api from './api';

export async function sendToAllStores(data) {
  const res = await api.post('/communication/stores/all', data);
  return res.data;
}

export async function sendToStore(storeId, data) {
  const res = await api.post(`/communication/stores/${storeId}`, data);
  return res.data;
}

export async function sendToAllUsers(data) {
  const res = await api.post('/communication/users/all', data);
  return res.data;
}

export async function sendToUser(userId, data) {
  const res = await api.post(`/communication/users/${userId}`, data);
  return res.data;
}
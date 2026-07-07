import api from './api';

export async function getCommunicationUsers() {
  const res = await api.get('/communication/users');
  return res.data;
}

export async function sendCommunication(data) {
  const res = await api.post('/communication/send', data);
  return res.data;
}
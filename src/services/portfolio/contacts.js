import api from './api';

export async function getContacts() {
  const res = await api.get('/contacts');
  return res.data;
}

export async function markAsRead(id) {
  const res = await api.put(`/contacts/${id}`);
  return res.data;
}
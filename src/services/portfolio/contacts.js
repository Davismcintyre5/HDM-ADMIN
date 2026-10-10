import api from './api';

export async function getContacts(params) {
  const res = await api.get('/contacts', { params });
  return res.data;
}

export async function getContact(id) {
  const res = await api.get(`/contacts/${id}`);
  return res.data;
}

export async function markAsRead(id) {
  const res = await api.put(`/contacts/${id}/read`);
  return res.data;
}

export async function markAsArchived(id) {
  const res = await api.put(`/contacts/${id}/archive`);
  return res.data;
}

export async function deleteContact(id) {
  const res = await api.delete(`/contacts/${id}`);
  return res.data;
}
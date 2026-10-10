import api from './api';

export async function getSmartGenUsers(params) {
  const res = await api.get('/smartgen-users', { params });
  return res.data;
}

export async function suspendSmartGenUser(id) {
  const res = await api.put(`/smartgen-users/${id}/suspend`);
  return res.data;
}

export async function activateSmartGenUser(id) {
  const res = await api.put(`/smartgen-users/${id}/activate`);
  return res.data;
}

export async function deleteSmartGenUser(id) {
  const res = await api.delete(`/smartgen-users/${id}`);
  return res.data;
}
import { get, post, patch, del } from './api';

export async function getAdmins(params = {}) {
  const { data, meta } = await get('/admins', { params });
  return { data: data || [], meta };
}

export async function createAdmin(payload) {
  const { data } = await post('/admins', payload);
  return data;
}

export async function updateAdmin(id, payload) {
  const { data } = await patch(`/admins/${id}`, payload);
  return data;
}

export async function deleteAdmin(id) {
  const { data } = await del(`/admins/${id}`);
  return data;
}
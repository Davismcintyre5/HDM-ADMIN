import { get, post, patch, del } from './api';

export async function getLegalDocs() {
  const { data } = await get('/legal');
  return data || [];
}

export async function getLegalDoc(id) {
  const { data } = await get(`/legal/${id}`);
  return data;
}

export async function createLegalDoc(payload) {
  const { data } = await post('/legal', payload);
  return data;
}

export async function updateLegalDoc(id, payload) {
  const { data } = await patch(`/legal/${id}`, payload);
  return data;
}

export async function deleteLegalDoc(id) {
  const { data } = await del(`/legal/${id}`);
  return data;
}
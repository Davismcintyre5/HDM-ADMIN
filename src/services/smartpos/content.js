import api from './api';

export async function getAllContent() {
  const res = await api.get('/content');
  return res.data.data; // { content }
}

export async function saveContent(section, data) {
  const res = await api.put(`/content/${section}`, data);
  return res.data.data;
}

export async function deleteContent(section) {
  const res = await api.delete(`/content/${section}`);
  return res.data;
}
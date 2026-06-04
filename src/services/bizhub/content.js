import api from './api';

export async function getAllContent() {
  const res = await api.get('/content');
  return res.data;
}

export async function getContent(section) {
  const res = await api.get(`/content/${section}`);
  return res.data;
}

export async function updateContent(section, data) {
  const res = await api.put(`/content/${section}`, data);
  return res.data;
}
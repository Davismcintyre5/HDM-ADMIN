import api from './api';

export async function getSoftware(params = {}) {
  const res = await api.get('/software', { params });
  return res.data;
}

export async function getSoftwareItem(id) {
  const res = await api.get(`/software/${id}`);
  return res.data;
}

export async function createSoftware(formData) {
  const res = await api.post('/software', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateSoftware(id, formData) {
  const res = await api.put(`/software/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteSoftware(id) {
  const res = await api.delete(`/software/${id}`);
  return res.data;
}
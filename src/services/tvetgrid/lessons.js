import api from './api';

export async function getLessons(params) {
  const res = await api.get('/lessons', { params });
  return res.data;
}

export async function getLesson(id) {
  const res = await api.get(`/lessons/${id}`);
  return res.data;
}

export async function createLesson(data) {
  const res = await api.post('/lessons', data);
  return res.data;
}

export async function updateLesson(id, data) {
  const res = await api.patch(`/lessons/${id}`, data);
  return res.data;
}

export async function deleteLesson(id) {
  const res = await api.delete(`/lessons/${id}`);
  return res.data;
}

export async function requestUploadSignature({ folder, resourceType } = {}) {
  const res = await api.post('/lessons/upload/sign', {
    folder: folder || 'tvetgrid/lessons',
    resourceType: resourceType || 'video',
  });
  return res.data;
}

export async function confirmUpload({ publicId, resourceType }) {
  const res = await api.post('/lessons/upload/confirm', {
    publicId,
    resourceType,
  });
  return res.data;
}

export async function summarizeLesson(id) {
  const res = await api.post(`/lessons/${id}/summarize`);
  return res.data;
}
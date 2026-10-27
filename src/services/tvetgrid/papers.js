import api from './api';

export async function getPapers(params) {
  const res = await api.get('/papers', { params });
  return res.data;
}

export async function getPaper(id) {
  const res = await api.get(`/papers/${id}`);
  return res.data;
}

export async function requestUploadSignature({
  folder = 'tvetgrid/papers',
  resourceType = 'raw',
} = {}) {
  const res = await api.post('/papers/upload/sign', { folder, resourceType });
  return res.data;
}

export async function confirmUpload({ publicId, resourceType = 'raw' }) {
  const res = await api.post('/papers/upload/confirm', {
    publicId,
    resourceType,
  });
  return res.data;
}

export async function createPaper(data) {
  const res = await api.post('/papers', data);
  return res.data;
}

export async function updatePaper(id, data) {
  const res = await api.patch(`/papers/${id}`, data);
  return res.data;
}

export async function renamePaper(id, title) {
  const res = await api.patch(`/papers/${id}/rename`, { title });
  return res.data;
}

export async function replacePaperPdf(id, sourcePdf) {
  const res = await api.patch(`/papers/${id}/replace`, { sourcePdf });
  return res.data;
}

export async function updatePaperQuestions(id, questions) {
  const res = await api.patch(`/papers/${id}/questions`, { questions });
  return res.data;
}

export async function deletePaper(id) {
  const res = await api.delete(`/papers/${id}`);
  return res.data;
}
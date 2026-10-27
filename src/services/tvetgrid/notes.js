import api from './api';

export async function getNotes(params) {
  const res = await api.get('/notes', { params });
  return res.data;
}

export async function getNote(id) {
  const res = await api.get(`/notes/${id}`);
  return res.data;
}

export async function requestUploadSignature({
  folder = 'tvetgrid/notes',
  resourceType = 'auto',
} = {}) {
  const res = await api.post('/notes/upload/sign', { folder, resourceType });
  return res.data;
}

export async function confirmUpload({ publicId, resourceType = 'auto' }) {
  const res = await api.post('/notes/upload/confirm', {
    publicId,
    resourceType,
  });
  return res.data;
}

export async function createNote(data) {
  const res = await api.post('/notes', data);
  return res.data;
}

export async function updateNote(id, data) {
  const res = await api.patch(`/notes/${id}`, data);
  return res.data;
}

export async function renameNote(id, title) {
  const res = await api.patch(`/notes/${id}/rename`, { title });
  return res.data;
}

export async function replaceNoteFiles(id, files) {
  const res = await api.patch(`/notes/${id}/replace`, { files });
  return res.data;
}

export async function deleteNote(id) {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
}

export async function generateQuestions(id, count = 5) {
  const res = await api.post(`/notes/${id}/generate-questions`, { count });
  return res.data;
}
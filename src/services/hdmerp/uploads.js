import api from './api';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
export async function deleteFile(publicId) { const res = await api.delete(`/uploads/${publicId}`); return res.data; }
import api from './api';

export async function getPhotos() {
  const res = await api.get('/photos');
  return res.data;
}

export async function uploadPhoto(formData) {
  const res = await api.post('/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deletePhoto(id) {
  const res = await api.delete(`/photos/${id}`);
  return res.data;
}
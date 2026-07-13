import api from './api';

export async function getCloudinaryStats() {
  const res = await api.get('/cloudinary/stats');
  return res.data;
}

export async function getCloudinaryFolders() {
  const res = await api.get('/cloudinary/folders');
  return res.data;
}

export async function getCloudinaryFolder(folder) {
  const res = await api.get(`/cloudinary/folders/${folder}`);
  return res.data;
}

export async function getCloudinaryFile(publicId) {
  const res = await api.get('/cloudinary/file', { params: { publicId } });
  return res.data;
}

export async function deleteCloudinaryFiles(publicIds) {
  const res = await api.delete('/cloudinary/file', { data: { publicIds } });
  return res.data;
}

export async function uploadCloudinaryFile(formData) {
  const res = await api.post('/cloudinary/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function createCloudinaryFolder(path) {
  const res = await api.post('/cloudinary/folder', { path });
  return res.data;
}

export async function deleteCloudinaryFolder(prefix) {
  const res = await api.delete('/cloudinary/folder', { data: { prefix } });
  return res.data;
}

export async function renameCloudinaryFile(from, to) {
  const res = await api.post('/cloudinary/rename', { from, to });
  return res.data;
}
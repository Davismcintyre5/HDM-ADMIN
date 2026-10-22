import api from './api';

export async function getCompany() {
  const res = await api.get('/company');
  return res.data;
}

export async function updateCompany(data) {
  const res = await api.put('/company', data);
  return res.data;
}

export async function uploadLogo(formData) {
  const res = await api.post('/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadLogoDark(formData) {
  const res = await api.post('/company/logo-dark', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadFavicon(formData) {
  const res = await api.post('/company/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadStamp(formData) {
  const res = await api.post('/company/stamp', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadSeal(formData) {
  const res = await api.post('/company/seal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
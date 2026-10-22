import api from './api';

export async function listCommunications(params) {
  const res = await api.get('/communications', { params });
  return res.data;
}

export async function getCommunication(id) {
  const res = await api.get(`/communications/${id}`);
  return res.data;
}

export async function createCommunication(data) {
  const res = await api.post('/communications', data);
  return res.data;
}

export async function updateCommunication(id, data) {
  const res = await api.put(`/communications/${id}`, data);
  return res.data;
}

export async function deleteCommunication(id) {
  const res = await api.delete(`/communications/${id}`);
  return res.data;
}

export async function regenerateAdvert(id) {
  const res = await api.post(`/communications/${id}/regenerate`);
  return res.data;
}

export async function publishCommunication(id) {
  const res = await api.post(`/communications/${id}/publish`);
  return res.data;
}

export async function unpublishCommunication(id) {
  const res = await api.post(`/communications/${id}/unpublish`);
  return res.data;
}

export async function archiveCommunication(id) {
  const res = await api.post(`/communications/${id}/archive`);
  return res.data;
}

export async function uploadCommunicationImage(id, formData) {
  const res = await api.post(`/communications/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function removeCommunicationImage(id, publicId) {
  const res = await api.delete(`/communications/${id}/images/${encodeURIComponent(publicId)}`);
  return res.data;
}

export async function sendCommunicationEmail(id, data) {
  const res = await api.post(`/communications/${id}/send-email`, data);
  return res.data;
}

export async function sendCommunicationSms(id, data) {
  const res = await api.post(`/communications/${id}/send-sms`, data);
  return res.data;
}
import api from './api';

export async function getInquiries() {
  const res = await api.get('/inquiries');
  return res.data.data; // { inquiries }
}

export async function resolveInquiry(id) {
  const res = await api.put(`/inquiries/${id}/resolve`);
  return res.data;
}

export async function deleteInquiry(id) {
  const res = await api.delete(`/inquiries/${id}`);
  return res.data;
}
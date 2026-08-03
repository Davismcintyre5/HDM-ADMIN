import api from './api';

export async function getTickets(params) {
  const res = await api.get('/support', { params });
  return res.data;
}

export async function getTicket(id) {
  const res = await api.get(`/support/${id}`);
  return res.data;
}

export async function updateTicket(id, data) {
  const res = await api.patch(`/support/${id}`, data);
  return res.data;
}
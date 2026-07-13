import api from './api';

export async function getTickets(params) {
  const res = await api.get('/support', { params });
  return res.data;
}

export async function getTicketStats() {
  const res = await api.get('/support/stats');
  return res.data;
}

export async function getTicket(id) {
  const res = await api.get(`/support/${id}`);
  return res.data;
}

export async function assignTicket(id) {
  const res = await api.put(`/support/${id}/assign`);
  return res.data;
}

export async function respondTicket(id, message) {
  const res = await api.post(`/support/${id}/respond`, { message });
  return res.data;
}

export async function resolveTicket(id) {
  const res = await api.put(`/support/${id}/resolve`);
  return res.data;
}
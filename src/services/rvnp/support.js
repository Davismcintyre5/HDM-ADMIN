import api from './api';

export async function getTickets(params) {
  const res = await api.get('/support/tickets', { params });
  return res.data;
}

export async function getTicket(id) {
  const res = await api.get(`/support/tickets/${id}`);
  return res.data;
}

export async function respondToTicket(id, data) {
  const res = await api.post(`/support/tickets/${id}/respond`, data);
  return res.data;
}

export async function updateTicketStatus(id, data) {
  const res = await api.patch(`/support/tickets/${id}/status`, data);
  return res.data;
}

export async function assignTicket(id, data) {
  const res = await api.post(`/support/tickets/${id}/assign`, data);
  return res.data;
}

export async function addTicketNote(id, data) {
  const res = await api.post(`/support/tickets/${id}/note`, data);
  return res.data;
}

export async function getSupportAnalytics() {
  const res = await api.get('/support/analytics');
  return res.data;
}
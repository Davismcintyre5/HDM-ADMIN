import api from './api';

export async function getTickets(params = {}) {
  const res = await api.get('/tickets', { params });
  return res.data;
}

export async function getTicket(ticketId) {
  const res = await api.get(`/tickets/${ticketId}`);
  return res.data.data;
}

export async function assignTicket(ticketId) {
  const res = await api.patch(`/tickets/${ticketId}/assign`);
  return res.data;
}

export async function replyTicket(ticketId, data) {
  const res = await api.post(`/tickets/${ticketId}/reply`, data);
  return res.data;
}

export async function updateTicketStatus(ticketId, status) {
  const res = await api.patch(`/tickets/${ticketId}/status`, { status });
  return res.data;
}

export async function updateTicketPriority(ticketId, priority) {
  const res = await api.patch(`/tickets/${ticketId}/priority`, { priority });
  return res.data;
}
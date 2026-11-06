// src/services/talanta/tickets.js
import api from './api';

export const getTickets = async ({ page = 1, limit = 20, status } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;

  const { data } = await api.get('/tickets', { params });
  return {
    items: data?.data || [],
    meta: data?.meta || { page: 1, limit, total: 0, pages: 1 },
  };
};

export const updateTicketStatus = async (id, status) => {
  const { data } = await api.patch(`/tickets/${id}`, { status });
  return data?.data || data;
};
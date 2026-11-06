// src/services/talanta/payments.js
import api from './api';

export const getPayments = async ({ page = 1, limit = 20, method, status } = {}) => {
  const params = { page, limit };
  if (method) params.method = method;
  if (status) params.status = status;

  const { data } = await api.get('/payments', { params });
  return {
    items: data?.data || [],
    meta: data?.meta || { page: 1, limit, total: 0, pages: 1 },
  };
};

export const getPayment = async (id) => {
  const { data } = await api.get(`/payments/${id}`);
  return data?.data || data;
};

export const confirmPayment = async (id) => {
  const { data } = await api.patch(`/payments/${id}/confirm`);
  return data?.data || data;
};
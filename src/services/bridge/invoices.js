import api from './api';

export async function getInvoices(params = {}) {
  const res = await api.get('/invoices', { params });
  return res.data;
}

export async function getInvoice(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function confirmInvoice(id, data) {
  const res = await api.post(`/invoices/${id}/confirm`, data);
  return res.data;
}

export async function rejectInvoice(id, data) {
  const res = await api.post(`/invoices/${id}/reject`, data);
  return res.data;
}
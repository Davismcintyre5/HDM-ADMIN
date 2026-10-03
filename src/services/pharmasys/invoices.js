import api from './api';

export async function getInvoices(params) {
  const res = await api.get('/invoices', { params });
  return res.data;
}

export async function getInvoice(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function markInvoicePaid(id, data) {
  const res = await api.post(`/invoices/${id}/mark-paid`, data);
  return res.data;
}

export async function cancelInvoice(id, data) {
  const res = await api.post(`/invoices/${id}/cancel`, data);
  return res.data;
}

export async function resendInvoice(id) {
  const res = await api.post(`/invoices/${id}/resend`);
  return res.data;
}
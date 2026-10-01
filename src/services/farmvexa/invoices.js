import api from './api';

export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const getInvoiceByUser = (userId) => api.get(`/invoices/user/${userId}`);
export const cancelInvoice = (id, data) => api.put(`/invoices/${id}/cancel`, data);
export const getInvoiceStats = () => api.get('/invoices/stats');
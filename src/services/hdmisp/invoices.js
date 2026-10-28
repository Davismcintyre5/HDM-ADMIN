import { get } from './api';

export async function getInvoices(params = {}) {
  const { data, meta } = await get('/invoices', { params });
  return { data: data || [], meta };
}

export async function getInvoice(id) {
  const { data } = await get(`/invoices/${id}`);
  return data;
}
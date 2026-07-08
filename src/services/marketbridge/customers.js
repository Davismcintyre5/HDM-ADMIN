import api from './api';

export async function getCustomerStats() {
  const res = await api.get('/customers/stats');
  return res.data;
}

export async function getCustomers(params = {}) {
  const res = await api.get('/customers', { params });
  return res.data;
}

export async function getCustomer(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

export async function getCustomerOrders(id) {
  const res = await api.get(`/customers/${id}/orders`);
  return res.data;
}

export async function getCustomerReviews(id) {
  const res = await api.get(`/customers/${id}/reviews`);
  return res.data;
}

export async function getCustomerAddresses(id) {
  const res = await api.get(`/customers/${id}/addresses`);
  return res.data;
}

export async function getCustomerWallet(id) {
  const res = await api.get(`/customers/${id}/wallet`);
  return res.data;
}

export async function suspendCustomer(id) {
  const res = await api.put(`/customers/${id}/suspend`);
  return res.data;
}

export async function activateCustomer(id) {
  const res = await api.put(`/customers/${id}/activate`);
  return res.data;
}

export async function deleteCustomer(id) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}
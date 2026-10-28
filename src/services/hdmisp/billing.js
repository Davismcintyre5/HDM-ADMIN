import { get, post } from './api';

export async function getTransactions(params = {}) {
  const { data, meta } = await get('/billing/transactions', { params });
  return { data: data || [], meta };
}

export async function getTransaction(id) {
  const { data } = await get(`/billing/transactions/${id}`);
  return data;
}

export async function getPendingPayments(params = {}) {
  const { data, meta } = await get('/billing/pending-payments', { params });
  return { data: data || [], meta };
}

export async function confirmPayment(payload) {
  // { transactionId, receiptNumber, notes }
  const { data } = await post('/billing/confirm-payment', payload);
  return data;
}

export async function rejectPayment(payload) {
  // { transactionId, reason }
  const { data } = await post('/billing/reject-payment', payload);
  return data;
}

export async function getBillingSummary() {
  const { data } = await get('/billing/summary');
  return data;
}

export async function getUpgradePayments(params = {}) {
  const { data, meta } = await get('/billing/upgrade-payments', { params });
  return { data: data || [], meta };
}
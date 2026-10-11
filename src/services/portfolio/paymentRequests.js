import { api } from './api';

export async function getPaymentRequests(params) {
  const res = await api.get('/payment-requests', { params });
  return res.data;
}

export async function getPaymentRequest(id) {
  const res = await api.get(`/payment-requests/${id}`);
  return res.data;
}

export async function createPaymentRequest(data) {
  const res = await api.post('/payment-requests', data);
  return res.data;
}

export async function initiatePaymentRequest(id) {
  const res = await api.post(`/payment-requests/${id}/initiate`);
  return res.data;
}

export async function cancelPaymentRequest(id) {
  const res = await api.post(`/payment-requests/${id}/cancel`);
  return res.data;
}

export async function deletePaymentRequest(id) {
  const res = await api.delete(`/payment-requests/${id}`);
  return res.data;
}

const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
};

export async function downloadInvoicePdf(request) {
  const id = request._id || request.id;
  const res = await api.get(`/payment-requests/${id}/invoice.pdf`, {
    responseType: 'blob',
  });
  const filename = `${request.invoiceNumber || request.reference || 'invoice'}.pdf`;
  triggerBlobDownload(res.data, filename);
}

export async function downloadReceiptPdf(request) {
  const id = request._id || request.id;
  const res = await api.get(`/payment-requests/${id}/receipt.pdf`, {
    responseType: 'blob',
  });
  const name =
    request.mpesaReceiptNumber ||
    request.invoiceNumber ||
    request.reference ||
    'receipt';
  triggerBlobDownload(res.data, `Receipt-${name}.pdf`);
}

export async function downloadStatementPdf({ from, to, month, status } = {}) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  else {
    if (from) params.set('from', from);
    if (to) params.set('to', to);
  }
  if (status) params.set('status', status);

  const query = params.toString();
  const url = `/payment-requests/statement.pdf${query ? `?${query}` : ''}`;

  const res = await api.get(url, { responseType: 'blob' });

  const label = month || (from && to ? `${from}_to_${to}` : from || to || 'Full');
  const filename = `Statement-${label}.pdf`;

  triggerBlobDownload(res.data, filename);
}
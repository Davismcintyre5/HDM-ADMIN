import api from './api';

export async function getRecipients() {
  const res = await api.get('/email/recipients');
  return res.data;
}

export async function sendEmail(data) {
  const res = await api.post('/email/send', data);
  return res.data;
}
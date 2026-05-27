import api from './api';

export async function getLanding() {
  const res = await api.get('/landing');
  return res.data.data;
}

export async function updateHero(data) {
  const res = await api.put('/landing/hero', data);
  return res.data;
}

export async function updateFeatures(data) {
  const res = await api.put('/landing/features', data);
  return res.data;
}

export async function updateTestimonials(data) {
  const res = await api.put('/landing/testimonials', data);
  return res.data;
}

export async function updateFaqs(data) {
  const res = await api.put('/landing/faqs', data);
  return res.data;
}

export async function updateFooter(data) {
  const res = await api.put('/landing/footer', data);
  return res.data;
}
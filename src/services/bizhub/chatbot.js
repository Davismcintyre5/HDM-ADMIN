import api from './api';

export async function getChatbotSettings() {
  const res = await api.get('/chatbot');
  return res.data;
}

export async function updateChatbotSettings(data) {
  const res = await api.put('/chatbot', data);
  return res.data;
}

export async function getAISettings() {
  const res = await api.get('/chatbot/ai');
  return res.data;
}

export async function updateAISettings(data) {
  const res = await api.put('/chatbot/ai', data);
  return res.data;
}

export async function testAIConnection() {
  const res = await api.post('/chatbot/ai/test');
  return res.data;
}
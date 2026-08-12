import api from './api';

export async function getWeatherTest() {
  const res = await api.get('/weather-test');
  return res.data;
}

export async function runWeatherTest() {
  const res = await api.post('/weather-test/run');
  return res.data;
}
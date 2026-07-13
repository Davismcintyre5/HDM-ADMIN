import api from './api';

export async function getMongoStats() {
  const res = await api.get('/mongodb/stats');
  return res.data;
}

export async function getMongoDatabases() {
  const res = await api.get('/mongodb/databases');
  return res.data;
}

export async function getMongoDatabase(db) {
  const res = await api.get(`/mongodb/database/${db}`);
  return res.data;
}

export async function getMongoCollection(db, col) {
  const res = await api.get(`/mongodb/database/${db}/${col}`);
  return res.data;
}

export async function queryMongoCollection(db, col, params) {
  const res = await api.get(`/mongodb/database/${db}/${col}/query`, { params });
  return res.data;
}

export async function dropMongoCollection(db, col) {
  const res = await api.delete(`/mongodb/database/${db}/${col}`);
  return res.data;
}

export async function dropMongoDatabase(db) {
  const res = await api.delete(`/mongodb/database/${db}`);
  return res.data;
}
import axios from "axios";

const BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.REACT_APP_BACKEND_URL
  ? import.meta.env.REACT_APP_BACKEND_URL
  : process.env.REACT_APP_BACKEND_URL;

// All backend API routes MUST be prefixed with '/api'
const API = `${BASE}/api`;

export function getClientId() {
  let id = localStorage.getItem("psych_client_id");
  if (!id) {
    id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem("psych_client_id", id);
  }
  return id;
}

const http = axios.create({ baseURL: API, timeout: 15000 });

export const api = {
  // health
  async ping() {
    return http.get("/");
  },
  // branches
  async getBranches() {
    const { data } = await http.get("/branches");
    return data;
  },
  async getBranch(slug) {
    const { data } = await http.get(`/branches/${slug}`);
    return data;
  },
  // state
  async getState(clientId) {
    const { data } = await http.get(`/state/${clientId}`);
    return data;
  },
  // bookmarks
  async setBookmark(clientId, slug, bookmarked) {
    const { data } = await http.put(`/state/${clientId}/bookmarks/${slug}`, { bookmarked });
    return data;
  },
  // tasks
  async getTasks(clientId, slug) {
    const { data } = await http.get(`/state/${clientId}/tasks/${slug}`);
    return data;
  },
  async putTasks(clientId, slug, tasks) {
    const { data } = await http.put(`/state/${clientId}/tasks/${slug}`, { tasks });
    return data;
  },
  // quiz
  async getQuiz(clientId) {
    const { data } = await http.get(`/state/${clientId}/quiz`);
    return data;
  },
  async putQuizBest(clientId, slug, best) {
    const { data } = await http.put(`/state/${clientId}/quiz/${slug}`, { best });
    return data;
  },
  // notes
  async getNotes(clientId) {
    const { data } = await http.get(`/state/${clientId}/notes`);
    return data;
  },
  async putNotes(clientId, notes) {
    const { data } = await http.put(`/state/${clientId}/notes`, { notes });
    return data;
  },
};
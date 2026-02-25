import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "https://server-winter-pond-1948.fly.dev";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization: Bearer <access_token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

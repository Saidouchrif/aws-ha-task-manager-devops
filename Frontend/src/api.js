import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error("Missing VITE_API_URL");
}

const api = axios.create({
  baseURL: stripTrailingSlash(rawApiUrl),
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed";
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    return Promise.reject(normalizedError);
  }
);

export default api;

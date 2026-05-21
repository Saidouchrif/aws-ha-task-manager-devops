import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

const resolveBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return stripTrailingSlash(import.meta.env.VITE_API_URL);
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000`;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
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

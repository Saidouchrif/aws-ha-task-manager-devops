import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

const resolveApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;

  if (envApiUrl) {
    return stripTrailingSlash(envApiUrl);
  }

  const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
  console.warn("VITE_API_URL is missing. Falling back to:", fallbackApiUrl);
  return fallbackApiUrl;
};

const api = axios.create({
  baseURL: resolveApiUrl(),
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

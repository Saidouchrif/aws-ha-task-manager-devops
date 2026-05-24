import axios from "axios";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

const resolveApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;

  if (envApiUrl) {
    return stripTrailingSlash(envApiUrl);
  }

  const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}`;
  console.warn("VITE_API_URL is missing. Falling back to:", fallbackApiUrl);
  return fallbackApiUrl;
};

const api = axios.create({
  baseURL: resolveApiUrl(),
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    // Load balancer can briefly hit a bad target; retry login once to reach a healthy app server.
    if (
      status === 502 &&
      requestUrl.includes("/api/auth/login") &&
      !originalRequest?._retriedLogin502
    ) {
      originalRequest._retriedLogin502 = true;
      return api(originalRequest);
    }

    const message = error.response?.data?.message || error.message || "Request failed";
    const normalizedError = new Error(message);
    normalizedError.status = status;
    return Promise.reject(normalizedError);
  }
);

export default api;

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const buildHeaders = (token, includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
};

const request = async (path, { method = "GET", body, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};

export const api = {
  getHealth: () => request("/"),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  getTasks: (token) => request("/api/tasks", { token }),
  createTask: (token, payload) => request("/api/tasks", { method: "POST", token, body: payload }),
  updateTask: (token, id, payload) => request(`/api/tasks/${id}`, { method: "PUT", token, body: payload }),
  deleteTask: (token, id) => request(`/api/tasks/${id}`, { method: "DELETE", token }),
};

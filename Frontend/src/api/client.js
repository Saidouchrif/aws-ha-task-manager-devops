import http from "../api";

const authConfig = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

export const api = {
  getHealth: async () => {
    const { data } = await http.get("/");
    return data;
  },
  register: async (payload) => {
    const { data } = await http.post("/api/auth/register", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await http.post("/api/auth/login", payload);
    return data;
  },
  getTasks: async (token) => {
    const { data } = await http.get("/api/tasks", authConfig(token));
    return data;
  },
  createTask: async (token, payload) => {
    const { data } = await http.post("/api/tasks", payload, authConfig(token));
    return data;
  },
  updateTask: async (token, id, payload) => {
    const { data } = await http.put(`/api/tasks/${id}`, payload, authConfig(token));
    return data;
  },
  deleteTask: async (token, id) => {
    const { data } = await http.delete(`/api/tasks/${id}`, authConfig(token));
    return data;
  },
};

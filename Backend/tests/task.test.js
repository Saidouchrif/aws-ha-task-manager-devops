const express = require("express");
const request = require("supertest");

jest.mock("../middlewares/authMiddleware", () =>
  jest.fn((req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== "Bearer valid-token") {
      return res.status(401).json({ message: "Access denied" });
    }

    req.user = {
      id: 1,
      email: "said@test.com",
    };

    return next();
  })
);

jest.mock("../controllers/taskController", () => ({
  createTask: jest.fn((req, res) =>
    res.status(201).json({
      id: 10,
      title: req.body.title,
      description: req.body.description || null,
      status: "pending",
      userId: req.user.id,
    })
  ),
  getTasks: jest.fn((req, res) =>
    res.status(200).json([
      {
        id: 10,
        title: "First task",
        description: "Demo",
        status: "pending",
        userId: req.user.id,
      },
    ])
  ),
  updateTask: jest.fn((req, res) =>
    res.status(200).json({
      id: Number(req.params.id),
      title: req.body.title || "Updated task",
      description: req.body.description || "Updated description",
      status: req.body.status || "done",
      userId: req.user.id,
    })
  ),
  deleteTask: jest.fn((req, res) =>
    res.status(200).json({ message: "Task deleted successfully" })
  ),
}));

const taskRoutes = require("../routes/taskRoutes");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/tasks", taskRoutes);
  return app;
};

describe("Task Routes", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  test("GET /api/tasks returns 401 when token is missing", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Access denied");
    expect(authMiddleware).toHaveBeenCalledTimes(1);
    expect(getTasks).not.toHaveBeenCalled();
  });

  test("POST /api/tasks returns 201 when token is valid", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "New task",
        description: "task description",
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("New task");
    expect(authMiddleware).toHaveBeenCalledTimes(1);
    expect(createTask).toHaveBeenCalledTimes(1);
  });

  test("GET /api/tasks returns 200 and list when token is valid", async () => {
    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(authMiddleware).toHaveBeenCalledTimes(1);
    expect(getTasks).toHaveBeenCalledTimes(1);
  });

  test("PUT /api/tasks/:id returns 200 when token is valid", async () => {
    const response = await request(app)
      .put("/api/tasks/10")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "Updated title",
        status: "done",
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(10);
    expect(response.body.title).toBe("Updated title");
    expect(response.body.status).toBe("done");
    expect(authMiddleware).toHaveBeenCalledTimes(1);
    expect(updateTask).toHaveBeenCalledTimes(1);
  });

  test("DELETE /api/tasks/:id returns 200 when token is valid", async () => {
    const response = await request(app)
      .delete("/api/tasks/10")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task deleted successfully");
    expect(authMiddleware).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenCalledTimes(1);
  });
});

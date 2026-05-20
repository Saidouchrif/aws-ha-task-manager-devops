const express = require("express");
const request = require("supertest");

jest.mock("../controllers/authController", () => ({
  register: jest.fn((req, res) => {
    if (!req.body?.name || !req.body?.email || !req.body?.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: 1,
        name: req.body.name,
        email: req.body.email,
      },
    });
  }),
  login: jest.fn((req, res) => {
    if (!req.body?.email || !req.body?.password) {
      return res.status(400).json({ message: "Missing credentials" });
    }
    if (req.body.password !== "123456") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.status(200).json({
      message: "Login successful",
      token: "fake-jwt-token",
    });
  }),
}));

const authRoutes = require("../routes/authRoutes");
const { register, login } = require("../controllers/authController");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
};

describe("Auth Routes", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  test("POST /api/auth/register returns 201 when payload is valid", async () => {
    const payload = {
      name: "Said",
      email: "said@test.com",
      password: "123456",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user.email).toBe(payload.email);
    expect(register).toHaveBeenCalledTimes(1);
  });

  test("POST /api/auth/register returns 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "said@test.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Missing required fields");
    expect(register).toHaveBeenCalledTimes(1);
  });

  test("POST /api/auth/login returns 200 and token on valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "said@test.com",
        password: "123456",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeDefined();
    expect(login).toHaveBeenCalledTimes(1);
  });

  test("POST /api/auth/login returns 401 on invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "said@test.com",
        password: "wrong-password",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
    expect(login).toHaveBeenCalledTimes(1);
  });
});

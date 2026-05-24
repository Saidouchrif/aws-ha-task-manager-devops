const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { sequelize } = require("./config/db");

require("./Models/userModel");
require("./Models/taskModel");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

const DB_CONNECT_MAX_RETRIES = Number(process.env.DB_CONNECT_MAX_RETRIES || 12);
const DB_CONNECT_RETRY_DELAY_MS = Number(
  process.env.DB_CONNECT_RETRY_DELAY_MS || 5000
);

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const waitForDatabase = async () => {
  for (let attempt = 1; attempt <= DB_CONNECT_MAX_RETRIES; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      const isLastAttempt = attempt === DB_CONNECT_MAX_RETRIES;
      console.error(
        `Database connection attempt ${attempt}/${DB_CONNECT_MAX_RETRIES} failed: ${error.message}`
      );

      if (isLastAttempt) {
        throw error;
      }

      await sleep(DB_CONNECT_RETRY_DELAY_MS);
    }
  }
};

const startServer = async () => {
  try {
    await waitForDatabase();

    await sequelize.sync();
    console.log("Database synchronized");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Keep these above ALB idle timeout to avoid intermittent 502 due to closed upstream sockets.
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

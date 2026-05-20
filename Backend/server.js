const express = require("express");
const cors = require("cors");

require("dotenv").config();

const {
  sequelize,
  checkDatabaseConnection,
} = require("./config/db");

require("./models/userModel");
require("./models/taskModel");

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

app.listen(PORT, async () => {

  console.log(`Server running on port ${PORT}`);

  await checkDatabaseConnection();

  await sequelize.sync();

  console.log("Database synchronized");

});
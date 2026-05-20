const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  checkDatabaseConnection,
} = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {

  console.log(`Server running on port ${PORT}`);

  await checkDatabaseConnection();

});
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const checkDatabaseConnection = async () => {
  try {

    await pool.query("SELECT 1");

    console.log("Database connected successfully");

  } catch (error) {

    console.error("Database connection failed");

  }
};

module.exports = {
  pool,
  checkDatabaseConnection,
};
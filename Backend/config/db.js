const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Database synchronization failed:", error.message);
  }
};

module.exports = {
  sequelize,
  checkDatabaseConnection,
  syncDatabase,
};

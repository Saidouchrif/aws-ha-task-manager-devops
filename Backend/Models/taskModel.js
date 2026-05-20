const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./userModel");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
}, {
  tableName: "tasks",
  timestamps: true,
});

User.hasMany(Task, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = Task;
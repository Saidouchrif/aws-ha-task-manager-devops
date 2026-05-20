const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  try {

    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      userId: req.user.id,
    });

    res.status(201).json(task);

  } catch (error) {

    res.status(500).json({
      message: "Server error",
    });

  }
};

const getTasks = async (req, res) => {
  try {

    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);

  } catch (error) {

    res.status(500).json({
      message: "Server error",
    });

  }
};

const updateTask = async (req, res) => {
  try {

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.update(req.body);

    res.json(task);

  } catch (error) {

    res.status(500).json({
      message: "Server error",
    });

  }
};

const deleteTask = async (req, res) => {
  try {

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.destroy();

    res.json({
      message: "Task deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
    });

  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
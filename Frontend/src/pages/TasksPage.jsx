import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import useAuth from "../auth/useAuth";

const STATUS_OPTIONS = ["pending", "in-progress", "done"];

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

const TasksPage = () => {
  const { token, user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [health, setHealth] = useState({
    isChecking: true,
    status: "unknown",
    message: "Checking backend health...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tasks]
  );

  const handleUnauthorized = useCallback(() => {
    logout();
  }, [logout]);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.getTasks(token);
      setTasks(Array.isArray(data) ? data : []);
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(requestError.message || "Failed to load tasks.");
    }
  }, [token, handleUnauthorized]);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setHealth({
        isChecking: false,
        status: "online",
        message: data?.message || "Backend API is running",
      });
    } catch {
      setHealth({
        isChecking: false,
        status: "offline",
        message: "Backend health endpoint is unreachable",
      });
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchTasks(), fetchHealth()]);
      if (isActive) {
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [fetchTasks, fetchHealth]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!createForm.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setIsSaving(true);
      const created = await api.createTask(token, {
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
      });

      setTasks((prev) => [created, ...prev]);
      setCreateForm({ title: "", description: "" });
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(requestError.message || "Unable to create task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("Delete this task?");
    if (!isConfirmed) {
      return;
    }

    try {
      setIsSaving(true);
      await api.deleteTask(token, taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(requestError.message || "Unable to delete task.");
    } finally {
      setIsSaving(false);
    }
  };

  const beginEdit = (task) => {
    setEditingTask({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      status: task.status || "pending",
    });
  };

  const updateEditingField = (event) => {
    const { name, value } = event.target;
    setEditingTask((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editingTask?.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setIsSaving(true);

      const updated = await api.updateTask(token, editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description.trim() || null,
        status: editingTask.status,
      });

      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
      setEditingTask(null);
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(requestError.message || "Unable to update task.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusClass = (status) => {
    if (status === "done") return "text-bg-success";
    if (status === "in-progress") return "text-bg-warning";
    return "text-bg-secondary";
  };

  return (
    <main className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-uppercase fw-semibold small text-primary mb-1">Task Manager</p>
          <h1 className="h3 fw-bold mb-1">My Tasks</h1>
          <p className="text-body-secondary mb-0">Logged in as {user?.email || "authenticated user"}</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge rounded-pill ${
              health.isChecking
                ? "text-bg-secondary"
                : health.status === "online"
                ? "text-bg-success"
                : "text-bg-danger"
            }`}
            title={health.message}
          >
            API: {health.isChecking ? "Checking" : health.status}
          </span>
          <button type="button" className="btn btn-outline-dark" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="h5 fw-semibold mb-3">Create Task</h2>
          <form onSubmit={handleCreateTask} className="row g-3" noValidate>
            <div className="col-12 col-md-5">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                value={createForm.title}
                onChange={handleCreateChange}
                placeholder="Finish sprint report"
                required
              />
            </div>

            <div className="col-12 col-md-5">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                id="description"
                name="description"
                type="text"
                className="form-control"
                value={createForm.description}
                onChange={handleCreateChange}
                placeholder="Optional details"
              />
            </div>

            <div className="col-12 col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={isSaving}>
                Add Task
              </button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-semibold mb-0">Task List</h2>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={fetchTasks}>
            Refresh
          </button>
        </div>

        {isLoading ? <p className="text-body-secondary">Loading tasks...</p> : null}

        {!isLoading && sortedTasks.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <p className="mb-0 text-body-secondary">No tasks yet. Create your first one.</p>
            </div>
          </div>
        ) : null}

        <div className="row g-3">
          {sortedTasks.map((task) => {
            const isEditing = editingTask?.id === task.id;

            return (
              <div className="col-12 col-lg-6" key={task.id}>
                <article className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    {isEditing ? (
                      <form className="d-grid gap-2" onSubmit={saveEdit}>
                        <input
                          name="title"
                          className="form-control"
                          value={editingTask.title}
                          onChange={updateEditingField}
                          required
                        />
                        <textarea
                          name="description"
                          className="form-control"
                          rows="2"
                          value={editingTask.description}
                          onChange={updateEditingField}
                        />
                        <select
                          name="status"
                          className="form-select"
                          value={editingTask.status}
                          onChange={updateEditingField}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option value={status} key={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <div className="d-flex gap-2 mt-2">
                          <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h3 className="h6 fw-bold mb-0">{task.title}</h3>
                          <span className={`badge rounded-pill ${statusClass(task.status)}`}>{task.status || "pending"}</span>
                        </div>
                        <p className="text-body-secondary mb-3">{task.description || "No description"}</p>
                        <p className="small text-body-tertiary mb-3">Created: {formatDate(task.createdAt)}</p>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => beginEdit(task)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default TasksPage;


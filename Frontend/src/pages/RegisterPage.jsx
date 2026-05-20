import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (requestError) {
      setError(requestError.message || "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page container py-5">
      <div className="auth-card card border-0 shadow-lg">
        <div className="card-body p-4 p-md-5">
          <p className="text-uppercase fw-semibold small text-primary mb-2">Task Manager</p>
          <h1 className="h3 fw-bold mb-3">Create account</h1>
          <p className="text-body-secondary mb-4">Start managing tasks with your secured workspace.</p>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}
          {success ? <div className="alert alert-success py-2">{success}</div> : null}

          <form onSubmit={handleSubmit} className="d-grid gap-3" noValidate>
            <div>
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control form-control-lg"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control form-control-lg"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control form-control-lg"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control form-control-lg"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-body-secondary mt-4 mb-0">
            Already registered? <Link to="/login" className="fw-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import useAuth from "../auth/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetPath = location.state?.from?.pathname || "/tasks";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const response = await api.login({
        email: form.email.trim(),
        password: form.password,
      });

      login({
        token: response.token,
        user: { email: form.email.trim() },
      });

      navigate(targetPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page container py-5">
      <div className="auth-card card border-0 shadow-lg">
        <div className="card-body p-4 p-md-5">
          <p className="text-uppercase fw-semibold small text-primary mb-2">Task Manager</p>
          <h1 className="h3 fw-bold mb-3">Sign in</h1>
          <p className="text-body-secondary mb-4">Access your task board with secure JWT session.</p>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <form onSubmit={handleSubmit} className="d-grid gap-3" noValidate>
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
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-body-secondary mt-4 mb-0">
            No account yet? <Link to="/register" className="fw-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;


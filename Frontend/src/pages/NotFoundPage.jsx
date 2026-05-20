import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="container py-5 text-center">
    <p className="text-uppercase small fw-semibold text-primary mb-2">404</p>
    <h1 className="h3 fw-bold mb-3">Page not found</h1>
    <p className="text-body-secondary mb-4">The page you requested does not exist.</p>
    <Link to="/tasks" className="btn btn-primary">
      Go to tasks
    </Link>
  </main>
);

export default NotFoundPage;

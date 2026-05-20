import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";
import FullPageLoader from "../components/FullPageLoader";

const ProtectedRoute = () => {
  const { isAuthReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


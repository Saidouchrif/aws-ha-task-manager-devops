import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";
import FullPageLoader from "../components/FullPageLoader";

const PublicOnlyRoute = () => {
  const { isAuthReady, isAuthenticated } = useAuth();

  if (!isAuthReady) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;


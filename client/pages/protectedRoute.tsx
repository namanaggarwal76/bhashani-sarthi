import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You can add a beautiful full-screen loader here
    return <div>Loading session...</div>;
  }

  // If loading is finished and there's no user, redirect to login.
  // The Outlet component renders the child route's element if authenticated.
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
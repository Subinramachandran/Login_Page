import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { profile, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // wait for profile check

  // not logged in → redirect to login and replace history
  if (!profile) return <Navigate to="/login" replace />; 

  return children; // logged in
};

export default ProtectedRoute;
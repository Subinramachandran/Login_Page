// AppRoutes.jsx
import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "./AuthContext";

const AppRoutes = () => {
  const { profile, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      {/* Login route */}
      <Route
        path="/login"
        element={
          profile ? (
            <Navigate to="/dashboard" replace /> // already logged in → skip login
          ) : (
            <Login />
          )
        }
      />

      {/* Protected dashboard route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Wildcard route */}
      <Route
        path="*"
        element={
          profile ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
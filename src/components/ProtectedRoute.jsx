// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  // Show nothing (or a loader) while auth/userData is loading
  if (loading) return null;

  // Not logged in
  if (!currentUser) return <Navigate to="/login" />;

  // Role-based access
  if (
    allowedRoles &&
    !allowedRoles.map(r => r.toLowerCase()).includes(userData?.role?.toLowerCase())
  ) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;

/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  const user = useAuthUser();
// wait until firbase checks user state
  if (user === undefined) {
    return <p className="page">Loading...</p>;
  }
// only use to prevent account page loading for non-user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
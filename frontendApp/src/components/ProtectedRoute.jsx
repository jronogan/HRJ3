import React, { use } from "react";
import UserContext from "../context/user";
import { Navigate } from "react-router";

const ProtectedRoute = (props) => {
  const userCtx = use(UserContext);
  const isAuthenticated = userCtx.accessToken.length > 0;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
};

export default ProtectedRoute;

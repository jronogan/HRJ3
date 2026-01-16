import React, { useState } from "react";
import UserContext from "./context/user";
import { Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import FitnessDisplay from "./components/FitnessDisplay/FitnessDisplay";
import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="container">
      <UserContext.Provider
        value={{ accessToken, setAccessToken, role, setRole }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route
            path="/fitness"
            element={
              <ProtectedRoute>
                <FitnessDisplay />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;

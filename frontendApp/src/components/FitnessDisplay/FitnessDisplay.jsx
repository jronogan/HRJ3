import React, { use } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import UserContext from "../../context/user";
import "./FitnessDisplay.css";

const FitnessDisplay = () => {
  const userCtx = use(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    userCtx.setAccessToken("");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="fitnessShell">
      <div className="fitnessNav">
        <div className="fitnessNavLinks">
          <Link to="/fitness">Dashboard</Link>
          <Link to="/fitness/nutrition-logs">Nutrition Logs</Link>
          <Link to="/fitness/workout-logs">Workout Logs</Link>
          <Link to="/fitness/workout-exercises">Workout Exercises</Link>
        </div>
        <button className="fitnessButton" onClick={logout}>
          Logout
        </button>
      </div>

      <Outlet />
    </div>
  );
};

export default FitnessDisplay;

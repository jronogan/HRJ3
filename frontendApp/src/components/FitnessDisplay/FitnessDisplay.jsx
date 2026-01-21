import React, { use } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import UserContext from "../../context/user";
import "./FitnessDisplay.css";

const FitnessDisplay = () => {
  const userCtx = use(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    userCtx.setAccessToken("");
    userCtx.setRefreshToken("");
    navigate("/login", { replace: true });
  };

  return (
    <div className="fitnessShell">
      <header className="ns-hero" style={{ marginBottom: "1rem" }}>
        <div className="ns-heroInner">
          <h1 className="ns-heroTitle">NutriFit</h1>
          <p className="ns-heroSubtitle">
            Your fitness and nutrition guide all in one!
          </p>
        </div>
      </header>

      <div className="fitnessNav">
        <div className="fitnessNavLinks">
          <Link to="/fitness">Dashboard</Link>
          <Link to="/fitness/nutrition-logs">Nutrition Logs</Link>
          <Link to="/fitness/workout-logs">Workout Logs</Link>
          <Link to="/fitness/workout-exercises">Workout Exercises</Link>
          <Link to="/fitness/user-profile">User Profile</Link>
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

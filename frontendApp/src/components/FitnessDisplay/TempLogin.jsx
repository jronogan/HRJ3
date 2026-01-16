import React, { use, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";
import "./FitnessDisplay.css";

const TempLogin = () => {
  const userCtx = use(UserContext);
  const navigate = useNavigate();
  const fetchData = useMemo(() => sharedFetch(), []);

  const [email, setEmail] = useState("bob@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetchData(
      "/users/login",
      "POST",
      { email, password },
      ""
    );

    if (res.ok) {
      const access = res.data?.access;
      const refresh = res.data?.refresh;

      if (!access) {
        setIsLoading(false);
        setError("Login succeeded but no access token returned");
        return;
      }

      userCtx.setAccessToken(access);
      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
      }

      setIsLoading(false);
      navigate("/fitness", { replace: true });
    } else {
      setIsLoading(false);
      setError(res.msg || "Login failed");
    }
  };

  return (
    <div className="fitnessShell">
      <div className="fitnessCard">
        <h2>Temp Login (for FitnessDisplay testing)</h2>
        <p className="fitnessMuted">
          This will be removed once the real auth pages land.
        </p>

        <form onSubmit={onSubmit} className="fitnessGrid">
          <div className="fitnessField">
            <label>Email</label>
            <input
              className="fitnessInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="fitnessField">
            <label>Password</label>
            <input
              className="fitnessInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="fitnessRow">
            <button className="fitnessButtonPrimary" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
            {error ? <span className="fitnessError">{error}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TempLogin;

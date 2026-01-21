import React, { use, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userCtx = use(UserContext);
  const fetchData = useMemo(
    () =>
      sharedFetch({
        getRefreshToken: () => userCtx.refreshToken,
        setAccessToken: userCtx.setAccessToken,
        onAuthError: () => {
          userCtx.setAccessToken("");
          userCtx.setRefreshToken("");
        },
      }),
    [userCtx],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchData("/users/login", "POST", { email, password });
      if (!res.ok) {
        throw new Error(res.msg || "Login failed");
      }

      const data = res.data;
      const access = data?.access ?? data?.accessToken ?? data?.token;
      const refresh = data?.refresh ?? data?.refreshToken;
      if (!access) {
        throw new Error("Login succeeded but no access token was returned");
      }

      userCtx.setRefreshToken(refresh || "");

      userCtx.setAccessToken(access);
      if (data?.role) userCtx.setRole(data.role);

      navigate("/fitness");
    } catch (err) {
      setError(err.message || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header
        className="ns-hero"
        style={{ maxWidth: 560, width: "100%", margin: "0 auto 18px" }}
      >
        <div className="ns-heroInner">
          <h1 className="ns-heroTitle">NutriFit</h1>
          <p className="ns-heroSubtitle">
            Your fitness and nutrition guide all in one!
          </p>
        </div>
      </header>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to continue your fitness journey</p>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

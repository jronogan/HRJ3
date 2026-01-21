import React, { use, useEffect, useMemo, useState } from "react";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";
import "./FitnessDisplay.css";

const goalOptions = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "weight_gain", label: "Weight gain" },
  { value: "maintenance", label: "Maintenance" },
];

const UserProfilePage = () => {
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
    [userCtx]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    goal: "",
    height: "",
    weight: "",
    gender: "",
    age: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const bmiValue = (() => {
    const h = Number(form.height);
    const w = Number(form.weight);
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0) return null;
    const m = h / 100;
    const bmi = w / (m * m);
    return Math.round(bmi * 10) / 10; // 1 decimal
  })();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await fetchData(
        "/users/me",
        "GET",
        undefined,
        userCtx.accessToken
      );
      if (!res.ok) {
        setError(res.msg || "Failed to load profile");
        setLoading(false);
        return;
      }

      const u = res.data?.user || {};
      setForm({
        name: u.name || "",
        email: u.email || "",
        goal: u.goal || "",
        height: u.height ?? "",
        weight: u.weight ?? "",
        gender: u.gender || "",
        age: u.age ?? "",
      });
      setLoading(false);
    };

    load();
  }, [fetchData, userCtx.accessToken]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage("");

    const payload = {
      name: form.name || undefined,
      email: form.email || undefined,
      goal: form.goal || undefined,
      height:
        form.height !== "" && form.height != null
          ? Number(form.height)
          : undefined,
      weight:
        form.weight !== "" && form.weight != null
          ? Number(form.weight)
          : undefined,
      gender: form.gender || undefined,
      age: form.age !== "" && form.age != null ? Number(form.age) : undefined,
    };

    const res = await fetchData(
      "/users/me",
      "PATCH",
      payload,
      userCtx.accessToken
    );

    if (!res.ok) {
      setError(res.msg || "Failed to save profile");
    } else {
      setMessage("Profile saved");
      const u = res.data?.user || {};
      setForm((prev) => ({
        ...prev,
        name: u.name ?? prev.name,
        email: u.email ?? prev.email,
        goal: u.goal ?? prev.goal,
        height: u.height ?? prev.height,
        weight: u.weight ?? prev.weight,
        gender: u.gender ?? prev.gender,
        age: u.age ?? prev.age,
      }));
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="fitnessCard">Loading profile...</div>;
  }

  return (
    <div className="fitnessCard">
      <h3>User Profile</h3>

      {error ? <div className="fitnessError">{error}</div> : null}
      {message ? (
        <div
          style={{
            padding: "8px 10px",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
            borderRadius: "6px",
            marginBottom: "0.5rem",
          }}
        >
          {message}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        <div className="form-group">
          <label>Name</label>
          <input
            className="fitnessInput"
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            className="fitnessInput"
            type="number"
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Goal</label>
          <select
            className="fitnessInput"
            value={form.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
          >
            <option value="">Select goal</option>
            {goalOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Height (cm)</label>
          <input
            className="fitnessInput"
            type="number"
            value={form.height}
            onChange={(e) => handleChange("height", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            className="fitnessInput"
            type="number"
            value={form.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            className="fitnessInput"
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className="fitnessInput"
            type="email"
            value={form.email}
            disabled
          />
        </div>

        <div className="form-group">
          <label>BMI</label>
          <input
            className="fitnessInput"
            type="text"
            value={bmiValue == null ? "—" : String(bmiValue)}
            disabled
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button
          className="fitnessButton"
          onClick={handleSave}
          disabled={saving}
          style={{ fontWeight: 600 }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;

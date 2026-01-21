import React, { use, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";
import {
  sumNutritionLog,
  sumWorkoutLog,
  toLocalISODate,
  weekdayKeyForDate,
} from "./fitnessUtils";
import "./FitnessDisplay.css";

const COLORS = {
  caloriesConsumed: "#3b82f6",
  caloriesRemaining: "#e5e7eb",
  caloriesOverflow: "#ef4444",
  protein: "#22c55e",
  carbs: "#f59e0b",
  fats: "#a855f7",
  other: "#64748b",
};

const MUSCLE_COLORS = {
  chest: "#ef4444",
  back: "#3b82f6",
  legs: "#22c55e",
  shoulders: "#f59e0b",
  biceps: "#a855f7",
  triceps: "#14b8a6",
  core: "#8b5cf6",
  cardio: "#f97316",
  forearms: "#64748b",
};

const FitnessDashboard = () => {
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [me, setMe] = useState(null);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);

  const [selectedDate, setSelectedDate] = useState(toLocalISODate(new Date()));

  const [isEditingNutrition, setIsEditingNutrition] = useState(false);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [nutritionForm, setNutritionForm] = useState({
    caloriesPerDay: "",
    proteinGramsPerDay: "",
    carbsGramsPerDay: "",
    fatsGramsPerDay: "",
  });
  const [workoutDayForm, setWorkoutDayForm] = useState([]);

  const loadAll = async () => {
    setIsLoading(true);
    setError(null);

    const meRes = await fetchData(
      "/users/me",
      "GET",
      undefined,
      userCtx.accessToken
    );
    if (!meRes.ok) {
      setIsLoading(false);
      setError(meRes.msg || "Failed to load user data");
      return;
    }

    const meData = meRes.data;
    setMe(meData);

    const userId = meData?.user?._id;
    if (!userId) {
      setIsLoading(false);
      setError("No userId returned from /users/me");
      return;
    }

    const [nRes, wRes] = await Promise.all([
      fetchData(
        `/nutritionlogs/users/${userId}`,
        "GET",
        undefined,
        userCtx.accessToken
      ),
      fetchData(
        `/workoutlogs/user/${userId}`,
        "GET",
        undefined,
        userCtx.accessToken
      ),
    ]);

    if (!nRes.ok) {
      setIsLoading(false);
      setError(nRes.msg || "Failed to load nutrition logs");
      return;
    }

    if (!wRes.ok) {
      setIsLoading(false);
      setError(wRes.msg || "Failed to load workout logs");
      return;
    }

    setNutritionLogs(Array.isArray(nRes.data) ? nRes.data : []);
    setWorkoutLogs(Array.isArray(wRes.data) ? wRes.data : []);

    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditNutritionGoal = () => {
    setNutritionForm({
      caloriesPerDay: nutritionGoal?.caloriesPerDay ?? "",
      proteinGramsPerDay: nutritionGoal?.proteinGramsPerDay ?? "",
      carbsGramsPerDay: nutritionGoal?.carbsGramsPerDay ?? "",
      fatsGramsPerDay: nutritionGoal?.fatsGramsPerDay ?? "",
    });
    setIsEditingNutrition(true);
  };

  const handleSaveNutritionGoal = async () => {
    const nutritionGoalId = me?.nutritionGoal?._id;
    if (!nutritionGoalId) {
      alert("No nutrition goal ID found");
      return;
    }

    const res = await fetchData(
      `/nutritiongoals/${nutritionGoalId}`,
      "PUT",
      {
        caloriesPerDay: parseFloat(nutritionForm.caloriesPerDay),
        proteinGramsPerDay: parseFloat(nutritionForm.proteinGramsPerDay),
        carbsGramsPerDay: parseFloat(nutritionForm.carbsGramsPerDay),
        fatsGramsPerDay: parseFloat(nutritionForm.fatsGramsPerDay),
      },
      userCtx.accessToken
    );

    if (!res.ok) {
      alert(res.msg || "Failed to update nutrition goal");
      return;
    }

    setIsEditingNutrition(false);
    await loadAll();
  };

  const handleEditWorkoutDay = (day) => {
    const groups = workoutGoal?.schedule?.[day]?.muscleGroups ?? [];
    setWorkoutDayForm([...groups]);
    setEditingDay(day);
    setIsEditingWorkout(true);
  };

  const handleToggleMuscleGroup = (muscleGroup) => {
    setWorkoutDayForm((prev) =>
      prev.includes(muscleGroup)
        ? prev.filter((g) => g !== muscleGroup)
        : [...prev, muscleGroup]
    );
  };

  const handleSaveWorkoutDay = async () => {
    const workoutGoalId = me?.workoutGoal?._id;
    if (!workoutGoalId) {
      alert("No workout goal ID found");
      return;
    }

    const updatedSchedule = {
      ...workoutGoal.schedule,
      [editingDay]: { muscleGroups: workoutDayForm },
    };

    const res = await fetchData(
      `/workoutgoals/${workoutGoalId}`,
      "PUT",
      {
        daysPerWeek: workoutGoal.daysPerWeek,
        schedule: updatedSchedule,
      },
      userCtx.accessToken
    );

    if (!res.ok) {
      alert(res.msg || "Failed to update workout goal");
      return;
    }

    setIsEditingWorkout(false);
    setEditingDay(null);
    await loadAll();
  };

  const MUSCLE_GROUPS = [
    "chest",
    "lower arms",
    "upper arms",
    "shoulders",
    "lower legs",
    "upper legs",
    "waist",
    "cardio",
    "back",
  ];

  const nutritionGoal = me?.nutritionGoal;
  const workoutGoal = me?.workoutGoal;

  const todaysNutritionLogs = nutritionLogs.filter(
    (l) => toLocalISODate(l?.date) === selectedDate
  );

  const nutritionTotals = todaysNutritionLogs.reduce(
    (acc, log) => {
      const t = sumNutritionLog(log);
      return {
        calories: acc.calories + t.calories,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fats: acc.fats + t.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const calorieGoal = nutritionGoal?.caloriesPerDay ?? 0;
  const caloriesConsumed = nutritionTotals.calories;
  const caloriesPct =
    calorieGoal > 0 ? (caloriesConsumed / calorieGoal) * 100 : 0;

  const CalorieCenterLabel = ({ viewBox }) => {
    const width = viewBox?.width ?? 0;
    const height = viewBox?.height ?? 0;
    const cx = (viewBox?.x ?? 0) + width / 2;
    const cy = (viewBox?.y ?? 0) + height / 2;
    const size = Math.min(width, height);
    const fontSize = Math.max(16, Math.round(size * 0.22));
    const value =
      calorieGoal > 0
        ? `${Math.round(caloriesPct)}%`
        : `${Math.round(caloriesConsumed)} cal`;

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize, fontWeight: 700, fill: "#1e40af" }}
      >
        {value}
      </text>
    );
  };

  const calorieDonutData = (() => {
    if (!calorieGoal || calorieGoal <= 0) {
      return [{ name: "Calories", value: caloriesConsumed || 0 }];
    }

    if (caloriesConsumed <= calorieGoal) {
      return [
        { name: "Consumed", value: caloriesConsumed },
        {
          name: "Remaining",
          value: Math.max(calorieGoal - caloriesConsumed, 0),
        },
      ];
    }

    return [
      { name: "Goal", value: calorieGoal },
      { name: "Overflow", value: caloriesConsumed - calorieGoal },
    ];
  })();

  const macroRows = [
    {
      name: "Protein",
      consumed: nutritionTotals.protein,
      goal: nutritionGoal?.proteinGramsPerDay ?? 0,
    },
    {
      name: "Carbs",
      consumed: nutritionTotals.carbs,
      goal: nutritionGoal?.carbsGramsPerDay ?? 0,
    },
    {
      name: "Fats",
      consumed: nutritionTotals.fats,
      goal: nutritionGoal?.fatsGramsPerDay ?? 0,
    },
  ].map((row) => {
    const pct = row.goal > 0 ? (row.consumed / row.goal) * 100 : 0;
    const remaining = row.goal > 0 ? Math.max(row.goal - row.consumed, 0) : 0;
    return {
      ...row,
      remaining,
      pct: Math.round(pct * 10) / 10,
      pctBar: Math.min(Math.round(pct * 10) / 10, 100),
    };
  });

  const todaysWorkoutLogs = workoutLogs.filter(
    (l) => toLocalISODate(l?.date) === selectedDate
  );

  const workoutByGroup = todaysWorkoutLogs.reduce((acc, log) => {
    const map = sumWorkoutLog(log);
    for (const [muscleGroup, stats] of map.entries()) {
      const prev = acc.get(muscleGroup) || { sets: 0, reps: 0, weight: 0 };
      acc.set(muscleGroup, {
        sets: prev.sets + stats.sets,
        reps: prev.reps + stats.reps,
        weight: prev.weight + stats.weight,
      });
    }
    return acc;
  }, new Map());

  const workoutGroupChart = Array.from(workoutByGroup.entries()).map(
    ([muscleGroup, stats]) => ({ muscleGroup, sets: stats.sets })
  );

  const workoutDailyChartHeight = Math.max(
    240,
    (workoutGroupChart.length || 0) * 28 + 40
  );

  const dayKey = weekdayKeyForDate(selectedDate);
  const plannedGroups = workoutGoal?.schedule?.[dayKey]?.muscleGroups ?? [];
  const completedGroups = Array.from(workoutByGroup.keys());

  if (isLoading) {
    return <div className="fitnessCard">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="fitnessCard">
        <div className="fitnessError">{error}</div>
        <button className="fitnessButton" onClick={loadAll}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="fitnessRow" style={{ justifyContent: "space-between" }}>
        <h2>Welcome, {me?.user?.name || "User"}</h2>
        <div className="fitnessRow">
          <label className="fitnessMuted">Date</label>
          <input
            className="fitnessInput"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="fitnessGrid">
        <div className="fitnessCard">
          <h3>
            Nutrition <span className="fitnessHeaderMeta">(Daily)</span>
          </h3>
          <div className="fitnessGrid">
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer minWidth={0} minHeight={240}>
                <PieChart>
                  <Pie
                    data={calorieDonutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                  >
                    {calorieDonutData.map((slice) => {
                      const fill =
                        slice.name === "Consumed" || slice.name === "Goal"
                          ? COLORS.caloriesConsumed
                          : slice.name === "Overflow"
                          ? COLORS.caloriesOverflow
                          : COLORS.caloriesRemaining;

                      return <Cell key={slice.name} fill={fill} />;
                    })}
                    <Label content={<CalorieCenterLabel />} position="center" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div>
                <strong>Calories:</strong> {Math.round(caloriesConsumed)} /{" "}
                {calorieGoal}{" "}
                {calorieGoal > 0 ? (
                  <span className="fitnessMuted">
                    ({Math.round(caloriesPct)}%)
                    {caloriesConsumed > calorieGoal
                      ? ` (+${Math.round(caloriesConsumed - calorieGoal)} over)`
                      : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 220, marginTop: "1rem" }}>
            <ResponsiveContainer minWidth={0} minHeight={220}>
              <BarChart
                data={macroRows}
                layout="vertical"
                margin={{ left: 30 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis type="category" dataKey="name" />
                <h3>
                  Workout{" "}
                  <span className="fitnessHeaderMeta">
                    (Daily + Weekly Plan)
                  </span>
                </h3>
                <Bar dataKey="pctBar" name="% of goal">
                  {macroRows.map((row) => (
                    <Cell
                      key={row.name}
                      fill={
                        row.name === "Protein"
                          ? COLORS.protein
                          : row.name === "Carbs"
                          ? COLORS.carbs
                          : COLORS.fats
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="fitnessTable" style={{ marginTop: "0.75rem" }}>
            <thead>
              <tr>
                <th>Macro</th>
                <th>Consumed</th>
                <th>Goal</th>
                <th>%</th>
                <th>
                  <button
                    className="fitnessButton"
                    onClick={handleEditNutritionGoal}
                    style={{
                      fontSize: "13px",
                      padding: "5px 9px",
                      fontWeight: 700,
                    }}
                  >
                    Edit
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {macroRows.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{Math.round(m.consumed)}g</td>
                  <td>{m.goal ? `${Math.round(m.goal)}g` : "—"}</td>
                  <td>{m.goal ? `${m.pct}%` : "—"}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="fitnessCard">
          <h3>
            Workout{" "}
            <span className="fitnessHeaderMeta">(Daily + Weekly Plan)</span>
          </h3>

          <div
            className="fitnessMuted"
            style={{ fontSize: "115%", marginBottom: "1rem" }}
          >
            Planned today ({dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}):{" "}
            {plannedGroups.length ? (
              <span
                style={{
                  display: "inline-flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginLeft: "8px",
                }}
              >
                {plannedGroups.map((group) => (
                  <span
                    key={group}
                    style={{
                      backgroundColor: "#edf2f7",
                      color: "#667eea",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      border: "1px solid #cbd5e0",
                    }}
                  >
                    {group}
                  </span>
                ))}
              </span>
            ) : (
              "Rest"
            )}
          </div>
          <div
            className="fitnessMuted"
            style={{ marginTop: "0.75rem", fontSize: "115%" }}
          >
            Completed today:{" "}
            {completedGroups.length ? (
              <span
                style={{
                  display: "inline-flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginLeft: "8px",
                }}
              >
                {completedGroups.map((group) => (
                  <span
                    key={group}
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#16a34a",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      border: "1px solid #86efac",
                    }}
                  >
                    {group}
                  </span>
                ))}
              </span>
            ) : (
              "none"
            )}
          </div>

          {todaysWorkoutLogs.length > 0 &&
            todaysWorkoutLogs.some((log) => log?.exercises?.length > 0) && (
              <table className="fitnessTable" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>Muscle Group</th>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysWorkoutLogs.flatMap((log) =>
                    (log?.exercises || []).map((ex, idx) => {
                      const muscleGroup = ex?.muscleGroup || "other";
                      const bgColor =
                        MUSCLE_COLORS[muscleGroup] || COLORS.other;
                      return (
                        <tr key={`${log._id}-${idx}`}>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                backgroundColor: bgColor,
                                color: "#ffffff",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            >
                              {muscleGroup}
                            </span>
                          </td>
                          <td style={{ textTransform: "capitalize" }}>
                            {ex?.name || "-"}
                          </td>
                          <td>{ex?.sets || 0}</td>
                          <td>{ex?.repetitions || 0}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

          <div style={{ marginTop: "8rem" }}>
            <strong>Weekly schedule</strong>
            <table className="fitnessTable" style={{ marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Muscle groups</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((d) => {
                  const groups = workoutGoal?.schedule?.[d]?.muscleGroups ?? [];
                  return (
                    <tr key={d}>
                      <td style={{ textTransform: "capitalize" }}>{d}</td>
                      <td>
                        {groups.length ? (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {groups.map((group) => (
                              <span
                                key={group}
                                className="muscle-badge"
                                style={{
                                  display: "inline-block",
                                  backgroundColor: "#edf2f7",
                                  color: "#667eea",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  border: "1px solid #cbd5e0",
                                }}
                              >
                                {group}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <button
                          className="fitnessButton"
                          onClick={() => handleEditWorkoutDay(d)}
                          style={{
                            fontSize: "13px",
                            padding: "5px 9px",
                            fontWeight: 700,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isEditingNutrition && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditingNutrition(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Nutrition Goals</h3>
            <div className="form-group">
              <label>Calories per day</label>
              <input
                type="number"
                className="fitnessInput"
                value={nutritionForm.caloriesPerDay}
                onChange={(e) =>
                  setNutritionForm({
                    ...nutritionForm,
                    caloriesPerDay: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Protein (g) per day</label>
              <input
                type="number"
                className="fitnessInput"
                value={nutritionForm.proteinGramsPerDay}
                onChange={(e) =>
                  setNutritionForm({
                    ...nutritionForm,
                    proteinGramsPerDay: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Carbs (g) per day</label>
              <input
                type="number"
                className="fitnessInput"
                value={nutritionForm.carbsGramsPerDay}
                onChange={(e) =>
                  setNutritionForm({
                    ...nutritionForm,
                    carbsGramsPerDay: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Fats (g) per day</label>
              <input
                type="number"
                className="fitnessInput"
                value={nutritionForm.fatsGramsPerDay}
                onChange={(e) =>
                  setNutritionForm({
                    ...nutritionForm,
                    fatsGramsPerDay: e.target.value,
                  })
                }
              />
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
              <button
                className="fitnessButton"
                onClick={handleSaveNutritionGoal}
              >
                Save
              </button>
              <button
                className="fitnessButton"
                onClick={() => setIsEditingNutrition(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingWorkout && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditingWorkout(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "22.4px" }}>
              Edit Workout for{" "}
              {editingDay?.charAt(0).toUpperCase() + editingDay?.slice(1)}
            </h3>
            <div style={{ marginTop: "1rem" }}>
              {/* UPPER SECTION */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "19.2px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#667eea",
                    marginBottom: "12px",
                    letterSpacing: "1px",
                  }}
                >
                  Upper
                </h4>
                <div>
                  {[
                    "chest",
                    "back",
                    "upper arms",
                    "lower arms",
                    "shoulders",
                  ].map((group) => (
                    <label
                      key={group}
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        cursor: "pointer",
                        fontSize: "16.8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={workoutDayForm.includes(group)}
                        onChange={() => handleToggleMuscleGroup(group)}
                        style={{ marginRight: "8px" }}
                      />
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* LOWER SECTION */}
              <div>
                <h4
                  style={{
                    fontSize: "19.2px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#667eea",
                    marginBottom: "12px",
                    letterSpacing: "1px",
                  }}
                >
                  Lower
                </h4>
                <div>
                  {["cardio", "waist", "lower legs", "upper legs"].map(
                    (group) => (
                      <label
                        key={group}
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          cursor: "pointer",
                          fontSize: "16.8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={workoutDayForm.includes(group)}
                          onChange={() => handleToggleMuscleGroup(group)}
                          style={{ marginRight: "8px" }}
                        />
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
              <button className="fitnessButton" onClick={handleSaveWorkoutDay}>
                Save
              </button>
              <button
                className="fitnessButton"
                onClick={() => setIsEditingWorkout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MacroTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="fitnessCard" style={{ padding: "0.5rem" }}>
      <div>
        <strong>{row.name}</strong>
      </div>
      <div>Consumed: {Math.round(row.consumed)}g</div>
      <div>Goal: {row.goal ? `${Math.round(row.goal)}g` : "—"}</div>
      <div>%: {row.goal ? `${row.pct}%` : "—"}</div>
    </div>
  );
};

export default FitnessDashboard;

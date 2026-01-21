import React, { use, useEffect, useMemo, useState } from "react";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";
import { formatWord, toLocalISODate } from "./fitnessUtils";
import "./FitnessDisplay.css";

const emptyExercise = () => ({
  name: "",
  muscleGroup: "lower arms",
  sets: "",
  repetitions: "",
  weight: "",
});

const WorkoutLogsPage = () => {
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

  const [userId, setUserId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState(toLocalISODate(new Date()));
  const [exercises, setExercises] = useState([emptyExercise()]);

  const [editingLogId, setEditingLogId] = useState(null);
  const [editDate, setEditDate] = useState(toLocalISODate(new Date()));
  const [editExercises, setEditExercises] = useState([emptyExercise()]);

  const [filterDate, setFilterDate] = useState("");

  const load = async () => {
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
      setError(meRes.msg || "Failed to load /users/me");
      return;
    }

    const uid = meRes.data?.user?._id;
    if (!uid) {
      setIsLoading(false);
      setError("No userId in /users/me response");
      return;
    }

    setUserId(uid);

    const logsRes = await fetchData(
      `/workoutlogs/user/${uid}`,
      "GET",
      undefined,
      userCtx.accessToken
    );

    if (!logsRes.ok) {
      setIsLoading(false);
      setError(logsRes.msg || "Failed to load workout logs");
      return;
    }

    const list = Array.isArray(logsRes.data) ? logsRes.data : [];
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLogs(list);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createLog = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("Missing userId");
      return;
    }

    const clean = exercises
      .filter((ex) => String(ex.name).trim().length)
      .map((ex) => ({
        name: String(ex.name).trim(),
        muscleGroup: String(ex.muscleGroup || "lower arms").toLowerCase(),
        sets: Number(ex.sets),
        repetitions: Number(ex.repetitions),
        weight: Number(ex.weight),
      }));

    if (!clean.length) {
      setError("Add at least one exercise");
      return;
    }

    const body = {
      userId,
      date: date ? new Date(date + "T12:00:00").toISOString() : undefined,
      exercises: clean,
    };

    const res = await fetchData(
      "/workoutlogs",
      "POST",
      body,
      userCtx.accessToken
    );
    if (!res.ok) {
      setError(res.msg || "Failed to create workout log");
      return;
    }

    setExercises([emptyExercise()]);
    await load();
  };

  const deleteLog = async (id) => {
    setError(null);
    const res = await fetchData(
      `/workoutlogs/${id}`,
      "DELETE",
      {},
      userCtx.accessToken
    );
    if (!res.ok) {
      setError(res.msg || "Failed to delete workout log");
      return;
    }
    await load();
  };

  const startEdit = (log) => {
    setEditingLogId(log._id);
    setEditDate(toLocalISODate(log.date));
    const existing = Array.isArray(log.exercises) ? log.exercises : [];
    setEditExercises(
      existing.map((ex) => ({
        name: ex.name ?? "",
        muscleGroup: String(ex.muscleGroup ?? "lower arms").toLowerCase(),
        sets: ex.sets ?? "",
        repetitions: ex.repetitions ?? "",
        weight: ex.weight ?? "",
      }))
    );
  };

  const saveEdit = async () => {
    if (!editingLogId) return;
    setError(null);

    const clean = editExercises
      .filter((ex) => String(ex.name).trim().length)
      .map((ex) => ({
        name: String(ex.name).trim(),
        muscleGroup: String(ex.muscleGroup || "lower arms").toLowerCase(),
        sets: Number(ex.sets),
        repetitions: Number(ex.repetitions),
        weight: Number(ex.weight),
      }));

    const body = {
      date: editDate
        ? new Date(editDate + "T12:00:00").toISOString()
        : undefined,
      exercises: clean,
    };

    const res = await fetchData(
      `/workoutlogs/${editingLogId}`,
      "PATCH",
      body,
      userCtx.accessToken
    );
    if (!res.ok) {
      setError(res.msg || "Failed to update workout log");
      return;
    }

    setEditingLogId(null);
    await load();
  };

  if (isLoading) {
    return <div className="fitnessCard">Loading workout logs...</div>;
  }

  const visibleLogs = filterDate
    ? logs.filter((l) => toLocalISODate(l?.date) === filterDate)
    : logs;

  return (
    <div>
      <div className="fitnessRow" style={{ justifyContent: "space-between" }}>
        <h2>Workout Logs</h2>
        <button className="fitnessButton" onClick={load}>
          Refresh
        </button>
      </div>

      {error ? (
        <div className="fitnessCard">
          <div className="fitnessError">{error}</div>
        </div>
      ) : null}

      <div className="fitnessCard" style={{ marginBottom: "1rem" }}>
        <h3>Add Workout Log</h3>
        <form onSubmit={createLog}>
          <div className="fitnessRow">
            <div className="fitnessField">
              <label>Date</label>
              <input
                className="fitnessInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="fitnessTableWrap" style={{ marginTop: "0.75rem" }}>
            <table className="fitnessTable">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Muscle Group</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Weight (kg)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        className="fitnessInput"
                        value={ex.name}
                        placeholder="Exercise"
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setExercises(next);
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="fitnessInput"
                        value={ex.muscleGroup}
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = {
                            ...next[idx],
                            muscleGroup: e.target.value,
                          };
                          setExercises(next);
                        }}
                      >
                        {[
                          "lower arms",
                          "shoulders",
                          "cardio",
                          "upper arms",
                          "chest",
                          "lower legs",
                          "back",
                          "upper legs",
                          "waist",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {formatWord(g)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={ex.sets}
                        placeholder="Sets"
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = { ...next[idx], sets: e.target.value };
                          setExercises(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={ex.repetitions}
                        placeholder="Reps"
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = {
                            ...next[idx],
                            repetitions: e.target.value,
                          };
                          setExercises(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={ex.weight}
                        placeholder="Weight"
                        onChange={(e) => {
                          const next = [...exercises];
                          next[idx] = {
                            ...next[idx],
                            weight: e.target.value,
                          };
                          setExercises(next);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fitnessButton"
                        onClick={() => {
                          const next = exercises.filter((_, i) => i !== idx);
                          setExercises(next.length ? next : [emptyExercise()]);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fitnessRow" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className="fitnessButton"
              onClick={() => setExercises([...exercises, emptyExercise()])}
            >
              Add Exercise
            </button>
            <button className="fitnessButtonPrimary" type="submit">
              Create Log
            </button>
          </div>
        </form>
      </div>

      <div className="fitnessCard">
        <h3>Existing Logs</h3>
        <div
          className="fitnessRow"
          style={{ marginTop: "0.5rem", alignItems: "flex-end" }}
        >
          <div className="fitnessField">
            <label>Filter by date</label>
            <input
              className="fitnessInput"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="fitnessField">
            <label>&nbsp;</label>
            <button
              type="button"
              className="fitnessButton"
              onClick={() => setFilterDate("")}
            >
              Show all
            </button>
          </div>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="fitnessMuted">No logs yet.</div>
        ) : null}

        {visibleLogs.map((log) => (
          <div key={log._id} style={{ marginTop: "1rem" }}>
            <div
              className="fitnessRow"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <strong>{toLocalISODate(log.date)}</strong>
              </div>
              <div className="fitnessRow">
                <button
                  className="fitnessButton"
                  onClick={() => startEdit(log)}
                >
                  Edit
                </button>
                <button
                  className="fitnessButton"
                  onClick={() => deleteLog(log._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingLogId === log._id ? (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="fitnessRow">
                  <input
                    className="fitnessInput"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                  <button className="fitnessButtonPrimary" onClick={saveEdit}>
                    Save
                  </button>
                  <button
                    className="fitnessButton"
                    onClick={() => setEditingLogId(null)}
                  >
                    Cancel
                  </button>
                </div>

                <div
                  className="fitnessTableWrap"
                  style={{ marginTop: "0.75rem" }}
                >
                  <table className="fitnessTable">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Muscle Group</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Weight</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editExercises.map((ex, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              className="fitnessInput"
                              value={ex.name}
                              onChange={(e) => {
                                const next = [...editExercises];
                                next[idx] = {
                                  ...next[idx],
                                  name: e.target.value,
                                };
                                setEditExercises(next);
                              }}
                            />
                          </td>
                          <td>
                            <select
                              className="fitnessInput"
                              value={ex.muscleGroup}
                              onChange={(e) => {
                                const next = [...editExercises];
                                next[idx] = {
                                  ...next[idx],
                                  muscleGroup: e.target.value,
                                };
                                setEditExercises(next);
                              }}
                            >
                              {[
                                "lower arms",
                                "shoulders",
                                "cardio",
                                "upper arms",
                                "chest",
                                "lower legs",
                                "back",
                                "upper legs",
                                "waist",
                              ].map((g) => (
                                <option key={g} value={g}>
                                  {formatWord(g)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="fitnessInput"
                              value={ex.sets}
                              onChange={(e) => {
                                const next = [...editExercises];
                                next[idx] = {
                                  ...next[idx],
                                  sets: e.target.value,
                                };
                                setEditExercises(next);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              className="fitnessInput"
                              value={ex.repetitions}
                              onChange={(e) => {
                                const next = [...editExercises];
                                next[idx] = {
                                  ...next[idx],
                                  repetitions: e.target.value,
                                };
                                setEditExercises(next);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              className="fitnessInput"
                              value={ex.weight}
                              onChange={(e) => {
                                const next = [...editExercises];
                                next[idx] = {
                                  ...next[idx],
                                  weight: e.target.value,
                                };
                                setEditExercises(next);
                              }}
                            />
                            {" kg"}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="fitnessButton"
                              onClick={() => {
                                const next = editExercises.filter(
                                  (_, i) => i !== idx
                                );
                                setEditExercises(
                                  next.length ? next : [emptyExercise()]
                                );
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="fitnessRow" style={{ marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    className="fitnessButton"
                    onClick={() =>
                      setEditExercises([...editExercises, emptyExercise()])
                    }
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            ) : (
              <div className="fitnessTableWrap" style={{ marginTop: "0.5rem" }}>
                <table className="fitnessTable">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Group</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(log.exercises || []).map((ex) => (
                      <tr key={ex._id || ex.name}>
                        <td>{ex.name}</td>
                        <td>{ex.muscleGroup}</td>
                        <td>{ex.sets}</td>
                        <td>{ex.repetitions}</td>
                        <td>{ex.weight} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutLogsPage;

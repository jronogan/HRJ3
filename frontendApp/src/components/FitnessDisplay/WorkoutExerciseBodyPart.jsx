import React, { use, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import sharedFetch from "../../shared/sharedFetch";
import UserContext from "../../context/user";
import { formatWord, toLocalISODate } from "./fitnessUtils";

const WorkoutExerciseBodyPart = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [me, setMe] = useState(null);
  const [addingForId, setAddingForId] = useState(null);
  const [addForm, setAddForm] = useState({
    date: toLocalISODate(new Date()),
    sets: "",
    repetitions: "",
    weight: "",
  });
  const userCtx = use(UserContext);
  const [isAdding, setIsAdding] = useState(false);
  const { muscleGroup } = useParams();
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

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = !normalizedQuery
    ? items
    : items.filter((ex) =>
        String(ex?.exerciseName || "")
          .toLowerCase()
          .includes(normalizedQuery)
      );

  useEffect(() => {
    const load = async () => {
      if (!muscleGroup) return;

      setIsLoading(true);
      setError("");

      // Load current user so we have userId for creating logs.
      const meRes = await fetchData(
        "/users/me",
        "GET",
        undefined,
        userCtx.accessToken
      );
      if (!meRes.ok) {
        setMe(null);
        setItems([]);
        setError(meRes.msg || "Failed to load /users/me");
        setIsLoading(false);
        return;
      }
      setMe(meRes.data);

      // sharedFetch expects `endpoint` (not a full URL). It will prepend VITE_SERVER.
      const res = await fetchData(
        `/workoutexercises/bodypart/${encodeURIComponent(muscleGroup)}`,
        "GET",
        undefined,
        userCtx.accessToken
      );

      if (!res.ok) {
        setItems([]);
        setError(res.msg || "Failed to load exercises");
        setIsLoading(false);
        return;
      }

      setItems(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    };

    load();
  }, [fetchData, muscleGroup, userCtx.accessToken]);

  const startAdd = (exercise) => {
    setError("");
    setAddingForId(exercise?._id ?? exercise?.exerciseName ?? "exercise");
    setAddForm({
      date: toLocalISODate(new Date()),
      sets: "",
      repetitions: "",
      weight: "",
    });
  };

  const cancelAdd = () => {
    setAddingForId(null);
    setAddForm({
      date: toLocalISODate(new Date()),
      sets: "",
      repetitions: "",
      weight: "",
    });
  };

  const submitAdd = async (exercise) => {
    setError("");

    const uid = me?.user?._id;
    if (!uid) {
      setError("Missing userId (try reloading or logging in again)");
      return;
    }

    const sets = Number(addForm.sets);
    const repetitions = Number(addForm.repetitions);
    const weight = Number(addForm.weight);
    if (!Number.isFinite(sets) || sets <= 0) {
      setError("Sets must be a number greater than 0");
      return;
    }
    if (!Number.isFinite(repetitions) || repetitions <= 0) {
      setError("Reps must be a number greater than 0");
      return;
    }
    if (!Number.isFinite(weight) || weight < 0) {
      setError("Weight must be a number (0 or more)");
      return;
    }

    setIsAdding(true);

    // Create a workout log for today containing this exercise.
    // (Matches how WorkoutLogsPage creates logs.)
    const body = {
      userId: uid,
      date: addForm.date
        ? new Date(addForm.date + "T12:00:00").toISOString()
        : new Date().toISOString(),
      exercises: [
        {
          name: String(exercise?.exerciseName || "").trim(),
          muscleGroup: String(
            exercise?.exerciseBodyParts || muscleGroup || ""
          ).trim(),
          sets,
          repetitions,
          weight,
        },
      ],
    };

    const res = await fetchData(
      "/workoutlogs",
      "POST",
      body,
      userCtx.accessToken
    );

    if (!res.ok) {
      setError(res.msg || "Failed to add workout log");
      setIsAdding(false);
      return;
    }

    setIsAdding(false);
    cancelAdd();
  };

  return (
    <div className="workout-exercise-bodypart">
      <h2 style={{ marginBottom: 8 }}>
        Exercises for:{" "}
        <span style={{ textTransform: "capitalize" }}>{muscleGroup}</span>
      </h2>

      <div className="fitnessCard" style={{ marginBottom: 12 }}>
        <div className="fitnessRow" style={{ justifyContent: "space-between" }}>
          <div className="fitnessField" style={{ flex: "1 1 320px" }}>
            <label>Search exercises</label>
            <input
              className="fitnessInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. curl, press, barbell"
            />
          </div>
          <button
            className="fitnessButton"
            onClick={() => setQuery("")}
            disabled={!query.trim().length}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading && <p>Loading exercises…</p>}

      {error && !isLoading && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!isLoading && !error && visibleItems.length === 0 && (
        <p>No exercises found for this body part.</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {visibleItems.map((ex) => {
          const id = ex?._id ?? `${ex?.exerciseName}-${ex?.equipment}`;
          const instructionsLines = String(ex?.instructions || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

          const currentKey = ex?._id ?? ex?.exerciseName ?? id;
          const isOpen = addingForId === currentKey;

          return (
            <article
              key={id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 240, flex: "1 1 360px" }}>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                    {formatWord(ex?.exerciseName) || "Unnamed exercise"}
                  </h3>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>
                      <strong>Body part:</strong> {ex?.exerciseBodyParts || "—"}
                    </span>
                    <span>
                      <strong>Equipment:</strong> {ex?.equipment || "—"}
                    </span>
                  </div>
                </div>

                {ex?.exerciseGif && (
                  <img
                    src={ex.exerciseGif}
                    alt={ex?.exerciseName || "Exercise gif"}
                    loading="lazy"
                    style={{ width: 180, maxWidth: "100%", borderRadius: 12 }}
                  />
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: 0 }}>Instructions</h4>
                {instructionsLines.length > 0 ? (
                  <ol style={{ marginTop: 8 }}>
                    {instructionsLines.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ol>
                ) : (
                  <p style={{ marginTop: 8 }}>No instructions provided.</p>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                {!isOpen ? (
                  <button
                    className="fitnessButton"
                    onClick={() => startAdd(ex)}
                  >
                    Add to Workout
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span>Date</span>
                        <input
                          type="date"
                          value={addForm.date}
                          onChange={(e) =>
                            setAddForm((p) => ({ ...p, date: e.target.value }))
                          }
                          className="fitnessInput"
                          style={{ width: 170 }}
                        />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <label style={{ display: "grid", gap: 4 }}>
                        <span>Sets</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={addForm.sets}
                          onChange={(e) =>
                            setAddForm((p) => ({ ...p, sets: e.target.value }))
                          }
                          className="fitnessInput"
                          style={{ width: 110 }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4 }}>
                        <span>Reps</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={addForm.repetitions}
                          onChange={(e) =>
                            setAddForm((p) => ({
                              ...p,
                              repetitions: e.target.value,
                            }))
                          }
                          className="fitnessInput"
                          style={{ width: 110 }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 4 }}>
                        <span>Weight (kg)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={addForm.weight}
                          onChange={(e) =>
                            setAddForm((p) => ({
                              ...p,
                              weight: e.target.value,
                            }))
                          }
                          className="fitnessInput"
                          style={{ width: 140 }}
                        />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        className="fitnessButton"
                        onClick={() => submitAdd(ex)}
                        disabled={isAdding}
                      >
                        {isAdding ? "Saving…" : "Save"}
                      </button>
                      <button
                        className="fitnessButton"
                        onClick={cancelAdd}
                        disabled={isAdding}
                        type="button"
                        style={{ background: "#e5e7eb", color: "#111827" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutExerciseBodyPart;

import React from "react";
import { Link } from "react-router";

const WorkoutExercisePage = () => {
  const MUSCLE_GROUPS = [
    "lower arms",
    "shoulders",
    "cardio",
    "upper arms",
    "chest",
    "lower legs",
    "back",
    "upper legs",
    "waist",
  ];

  const pretty = (s) =>
    String(s)
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="fitnessGrid">
      <div className="fitnessCard" style={{ gridColumn: "1 / -1" }}>
        <div className="fitnessRow" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Workout Exercises</h2>
            <p className="fitnessMuted" style={{ marginTop: 6 }}>
              Choose a body part to browse exercises.
            </p>
          </div>
        </div>
      </div>

      {MUSCLE_GROUPS.map((group) => (
        <Link
          key={group}
          to={`/fitness/workout-exercises/${group}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="fitnessCard" style={{ cursor: "pointer" }}>
            <div
              className="fitnessRow"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{pretty(group)}</h3>
                <div className="fitnessMuted" style={{ marginTop: 6 }}>
                  View exercises
                </div>
              </div>
              <span className="fitnessMuted" aria-hidden>
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default WorkoutExercisePage;

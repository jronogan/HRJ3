import React, { useEffect, useMemo, useState } from "react";
import { getRecommendations } from "../recommendations.js";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MUSCLE_GROUPS = [
  { value: "chest", label: "Chest" },
  { value: "lower arms", label: "Lower Arms" },
  { value: "upper arms", label: "Upper Arms" },
  { value: "shoulders", label: "Shoulders" },
  { value: "lower legs", label: "Lower Legs" },
  { value: "upper legs", label: "Upper Legs" },
  { value: "waist", label: "Waist" },
  { value: "cardio", label: "Cardio" },
  { value: "back", label: "Back" },
];

const SignupStep4 = ({
  onSubmit,
  onBack,
  formData,
  setFormData,
  isLoading,
}) => {
  const [errors, setErrors] = useState({});

  const handleDaysPerWeekChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      workoutGoal: {
        ...prev.workoutGoal,
        daysPerWeek: value,
        userEdited: true,
      },
    }));
  };

  const handleDayChange = (day, muscleGroup) => {
    setFormData((prev) => ({
      ...prev,
      workoutGoal: {
        ...prev.workoutGoal,
        userEdited: true,
        schedule: {
          ...prev.workoutGoal?.schedule,
          [day]: { muscleGroups: muscleGroup ? [muscleGroup] : [] },
        },
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.workoutGoal?.daysPerWeek) {
      newErrors.daysPerWeek = "Please select number of workouts per week";
    }

    let activeDays = 0;
    DAYS.forEach((day) => {
      const dayData = formData.workoutGoal?.schedule?.[day];
      if (dayData?.muscleGroups && dayData.muscleGroups.length > 0) {
        activeDays++;
      }
    });

    if (activeDays === 0) {
      newErrors.general = "Please select at least one workout day";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    } else {
      setErrors(newErrors);
    }
  };

  const rec = useMemo(() => getRecommendations(formData), [formData]);

  useEffect(() => {
    if (!rec) return;

    setFormData((prev) => {
      const wg = prev.workoutGoal || {};

      if (wg.userEdited) return prev;
      if (wg.recommendationKey === rec.recommendationKey) return prev;

      // Only set if not already chosen
      if (wg.daysPerWeek) return prev;

      return {
        ...prev,
        workoutGoal: {
          ...wg,
          daysPerWeek: rec.workout.daysPerWeek,
          schedule: wg.schedule || {},
          recommendationKey: rec.recommendationKey,
          userEdited: false,
        },
      };
    });
  }, [rec, setFormData]);

  return (
    <div className="signup-step">
      <h2>Your Workout Schedule</h2>
      <p className="step-description">
        Plan your weekly workout routine (Monday - Sunday)
      </p>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="error-banner">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="daysPerWeek">How many workouts per week? *</label>
          <select
            id="daysPerWeek"
            value={formData.workoutGoal?.daysPerWeek || ""}
            onChange={handleDaysPerWeekChange}
            className={errors.daysPerWeek ? "error" : ""}
          >
            <option value="">Select number of days...</option>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <option key={num} value={num}>
                {num} day{num > 1 ? "s" : ""} per week
              </option>
            ))}
          </select>
          {errors.daysPerWeek && (
            <span className="error-message">{errors.daysPerWeek}</span>
          )}
        </div>

        <div className="workout-schedule">
          <p className="schedule-subtitle">Select muscle group for each day:</p>
          {DAYS.map((day) => {
            const dayData = formData.workoutGoal?.schedule?.[day] || {};
            const selectedMuscle =
              dayData.muscleGroups && dayData.muscleGroups.length > 0
                ? dayData.muscleGroups[0]
                : "";

            return (
              <div key={day} className="workout-day-row">
                <label className="day-label">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
                <select
                  value={selectedMuscle || ""}
                  onChange={(e) => handleDayChange(day, e.target.value)}
                  className="day-select"
                >
                  <option value="">Rest Day</option>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <option key={muscle.value} value={muscle.value}>
                      {muscle.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupStep4;

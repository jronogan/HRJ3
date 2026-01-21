import React, { useMemo } from "react";
import { getRecommendations } from "../recommendations.js";

const GOAL_LABELS = {
  weight_gain: "Weight Gain",
  weight_loss: "Weight Loss",
  maintenance: "Maintenance",
};

const SignupStep2bRecommendations = ({
  onNext,
  onBack,
  formData,
  setFormData,
}) => {
  const rec = useMemo(() => getRecommendations(formData), [formData]);

  const apply = () => {
    if (!rec) return;

    setFormData((prev) => {
      // If already applied for this exact profile, do nothing
      const alreadyApplied =
        prev.nutritionGoal?.recommendationKey === rec.recommendationKey &&
        prev.workoutGoal?.recommendationKey === rec.recommendationKey;

      if (alreadyApplied) return prev;

      return {
        ...prev,
        nutritionGoal: {
          ...(prev.nutritionGoal || {}),
          caloriesPerDay: String(rec.calories),
          proteinGramsPerDay: String(rec.macros.proteinG),
          carbsGramsPerDay: String(rec.macros.carbsG),
          fatsGramsPerDay: String(rec.macros.fatG),
          recommendationKey: rec.recommendationKey,
          userEdited: false,
        },
        workoutGoal: {
          ...(prev.workoutGoal || {}),
          daysPerWeek: prev.workoutGoal?.daysPerWeek || rec.workout.daysPerWeek,
          schedule: prev.workoutGoal?.schedule || {},
          recommendationKey: rec.recommendationKey,
          userEdited: false,
        },
      };
    });

    onNext(); // go to Step3 (prefilled)
  };

  if (!rec) {
    return (
      <div className="signup-step">
        <h2>Recommendations</h2>
        <p className="step-description">
          Please complete your profile and select a goal first.
        </p>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>
    );
  }

  const goalLabel = GOAL_LABELS[formData.goal] || formData.goal;

  return (
    <div className="signup-step">
      <h2>Recommended Targets for {goalLabel}</h2>
      <p className="step-description">
        Based on your BMI category (Asian SG cutoffs), goal, and profile.
      </p>

      <div className="info-box" style={{ marginBottom: 12 }}>
        <div>
          <strong>BMI:</strong> {formData.bmi} ({formData.bmiCategory})
        </div>
        <div style={{ marginTop: 6, opacity: 0.9 }}>
          Estimated maintenance: <strong>{rec.tdee} kcal/day</strong>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Nutrition</h3>
        <ul>
          <li>
            <strong>Calories:</strong> {rec.calories} kcal/day
          </li>
          <li>
            <strong>Protein:</strong> {rec.macros.proteinG} g/day
          </li>
          <li>
            <strong>Carbs:</strong> {rec.macros.carbsG} g/day
          </li>
          <li>
            <strong>Fats:</strong> {rec.macros.fatG} g/day
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Workout</h3>
        <div>
          <strong>Suggested workouts/week:</strong> {rec.workout.daysPerWeek}
        </div>
        <ul>
          {rec.workout.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button type="button" onClick={apply} className="btn btn-primary">
          Apply & Continue
        </button>
      </div>
    </div>
  );
};

export default SignupStep2bRecommendations;

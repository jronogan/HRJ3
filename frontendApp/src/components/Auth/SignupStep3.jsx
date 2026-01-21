import React, { useEffect, useMemo, useState } from "react";
import { getRecommendations } from "../recommendations.js";

const SignupStep3 = ({ onNext, onBack, formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      nutritionGoal: {
        ...prev.nutritionGoal,
        [name]: value,
        userEdited: true,
      },
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    const calories = parseFloat(formData.nutritionGoal?.caloriesPerDay);
    if (
      !formData.nutritionGoal?.caloriesPerDay ||
      isNaN(calories) ||
      calories <= 0 ||
      calories > 10000
    ) {
      newErrors.caloriesPerDay = "Please enter valid calories (1-10000)";
    }

    const protein = parseFloat(formData.nutritionGoal?.proteinGramsPerDay);
    if (
      !formData.nutritionGoal?.proteinGramsPerDay ||
      isNaN(protein) ||
      protein < 0 ||
      protein > 1000
    ) {
      newErrors.proteinGramsPerDay = "Please enter valid protein (0-1000g)";
    }

    const carbs = parseFloat(formData.nutritionGoal?.carbsGramsPerDay);
    if (
      !formData.nutritionGoal?.carbsGramsPerDay ||
      isNaN(carbs) ||
      carbs < 0 ||
      carbs > 1000
    ) {
      newErrors.carbsGramsPerDay = "Please enter valid carbs (0-1000g)";
    }

    const fats = parseFloat(formData.nutritionGoal?.fatsGramsPerDay);
    if (
      !formData.nutritionGoal?.fatsGramsPerDay ||
      isNaN(fats) ||
      fats < 0 ||
      fats > 500
    ) {
      newErrors.fatsGramsPerDay = "Please enter valid fats (0-500g)";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onNext();
    } else {
      setErrors(newErrors);
    }
  };

  const rec = useMemo(() => getRecommendations(formData), [formData]);

  useEffect(() => {
    if (!rec) return;

    setFormData((prev) => {
      const ng = prev.nutritionGoal || {};

      // If user edited, never override
      if (ng.userEdited) return prev;

      // If already applied for this exact profile, do nothing
      if (ng.recommendationKey === rec.recommendationKey) return prev;

      const isEmpty =
        !ng.caloriesPerDay &&
        !ng.proteinGramsPerDay &&
        !ng.carbsGramsPerDay &&
        !ng.fatsGramsPerDay;

      // Only autofill when empty (prevents overriding manual values & avoids loops)
      if (!isEmpty) return prev;

      return {
        ...prev,
        nutritionGoal: {
          ...ng,
          caloriesPerDay: String(rec.calories),
          proteinGramsPerDay: String(rec.macros.proteinG),
          carbsGramsPerDay: String(rec.macros.carbsG),
          fatsGramsPerDay: String(rec.macros.fatG),
          recommendationKey: rec.recommendationKey,
          userEdited: false,
        },
      };
    });
  }, [rec, setFormData]);

  return (
    <div className="signup-step">
      <h2>Your Nutrition Goals</h2>
      <p className="step-description">
        Set your daily macro targets to track your nutrition
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="caloriesPerDay">Daily Calorie Target *</label>
          <input
            type="number"
            id="caloriesPerDay"
            name="caloriesPerDay"
            value={formData.nutritionGoal?.caloriesPerDay || ""}
            onChange={handleChange}
            className={errors.caloriesPerDay ? "error" : ""}
            placeholder="2000"
            step="1"
            min="1"
            max="10000"
          />
          {errors.caloriesPerDay && (
            <span className="error-message">{errors.caloriesPerDay}</span>
          )}
          <small className="form-hint">
            Total calories you want to consume per day
          </small>
        </div>

        <div className="macros-grid">
          <div className="form-group">
            <label htmlFor="proteinGramsPerDay">Protein (g/day) *</label>
            <input
              type="number"
              id="proteinGramsPerDay"
              name="proteinGramsPerDay"
              value={formData.nutritionGoal?.proteinGramsPerDay || ""}
              onChange={handleChange}
              className={errors.proteinGramsPerDay ? "error" : ""}
              placeholder="150"
              step="0.1"
              min="0"
              max="1000"
            />
            {errors.proteinGramsPerDay && (
              <span className="error-message">{errors.proteinGramsPerDay}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="carbsGramsPerDay">Carbs (g/day) *</label>
            <input
              type="number"
              id="carbsGramsPerDay"
              name="carbsGramsPerDay"
              value={formData.nutritionGoal?.carbsGramsPerDay || ""}
              onChange={handleChange}
              className={errors.carbsGramsPerDay ? "error" : ""}
              placeholder="200"
              step="0.1"
              min="0"
              max="1000"
            />
            {errors.carbsGramsPerDay && (
              <span className="error-message">{errors.carbsGramsPerDay}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fatsGramsPerDay">Fats (g/day) *</label>
            <input
              type="number"
              id="fatsGramsPerDay"
              name="fatsGramsPerDay"
              value={formData.nutritionGoal?.fatsGramsPerDay || ""}
              onChange={handleChange}
              className={errors.fatsGramsPerDay ? "error" : ""}
              placeholder="65"
              step="0.1"
              min="0"
              max="500"
            />
            {errors.fatsGramsPerDay && (
              <span className="error-message">{errors.fatsGramsPerDay}</span>
            )}
          </div>
        </div>

        <div className="info-box">
          <p>
            <strong>Note:</strong> Protein & Carbs have 4 cal/g, Fats have 9
            cal/g. Make sure your macros align with your calorie target.
          </p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupStep3;

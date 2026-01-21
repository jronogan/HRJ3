import React, { useEffect, useMemo, useState } from "react";

const SignupStep2 = ({ onNext, onBack, formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // If the user changes height/weight/gender/age after selecting a goal,
      // reset goal so they re-confirm it after seeing BMI advice.
      const shouldResetGoal =
        name === "height" ||
        name === "weight" ||
        name === "gender" ||
        name === "age";

      return {
        ...prev,
        [name]: value,
        ...(shouldResetGoal ? { goal: "" } : null),
      };
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // Also clear goal error if we reset it implicitly.
    if (
      (name === "height" ||
        name === "weight" ||
        name === "gender" ||
        name === "age") &&
      errors.goal
    ) {
      setErrors((prev) => ({ ...prev, goal: "" }));
    }
  };

  const heightCm = useMemo(() => {
    const n = parseFloat(formData.height);
    return Number.isFinite(n) ? n : NaN;
  }, [formData.height]);

  const weightKg = useMemo(() => {
    const n = parseFloat(formData.weight);
    return Number.isFinite(n) ? n : NaN;
  }, [formData.weight]);

  const ageNum = useMemo(() => {
    const n = parseInt(formData.age, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [formData.age]);

  const isProfileComplete = useMemo(() => {
    // Keep this minimal: selection visibility (not strict validation).
    return (
      formData.gender &&
      Number.isFinite(ageNum) &&
      Number.isFinite(heightCm) &&
      Number.isFinite(weightKg)
    );
  }, [ageNum, formData.gender, heightCm, weightKg]);

  const bmiInfo = useMemo(() => {
    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
    if (heightCm <= 0 || weightKg <= 0) return null;

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // Use your requested ranges/text.
    let category = "";
    let advice = "";

    if (bmi < 18.5) {
      category = "Underweight / Lean";
      advice =
        "Priority: Muscle & metabolic health - Muscle/Weight gain recommended";
    } else if (bmi >= 18.5 && bmi <= 22.9) {
      category = "Normal BMI (18.5–22.9)";
      advice = "Healthy Range - Select according to personal goals";
    } else if (bmi >= 23 && bmi <= 27.4) {
      category = "Overweight (23–27.4)";
      advice =
        "Priority: Insulin sensitivity, visceral fat reduction - Weight loss recommended";
    } else {
      // You didn’t specify >27.4, but we still show something sensible.
      category = "Above range";
      advice =
        "Priority: Fat reduction & overall health - weight loss recommended";
    }

    return { bmi, category, advice };
  }, [heightCm, weightKg]);

  useEffect(() => {
    if (!bmiInfo) return;

    setFormData((prev) => {
      const nextBmi = Number(bmiInfo.bmi.toFixed(1));

      // Avoid unnecessary updates -> helps prevent re-render loops
      const same =
        prev.bmi === nextBmi &&
        prev.bmiCategory === bmiInfo.category &&
        prev.bmiAdvice === bmiInfo.advice;

      if (same) return prev;

      return {
        ...prev,
        bmi: nextBmi,
        bmiCategory: bmiInfo.category, // UNDERWEIGHT/NORMAL/OVERWEIGHT/OBESE
        bmiAdvice: bmiInfo.advice,

        // Clear downstream recommendation state when profile changes
        nutritionGoal: {
          ...(prev.nutritionGoal || {}),
          recommendationKey: "", // so Step3 can re-autofill if needed
          userEdited: false,
        },
        workoutGoal: {
          ...(prev.workoutGoal || {}),
          recommendationKey: "",
          userEdited: false,
        },
      };
    });
  }, [bmiInfo, setFormData]);

  const validateForm = () => {
    const newErrors = {};

    const height = parseFloat(formData.height);
    if (!formData.height || isNaN(height) || height <= 0 || height > 300) {
      newErrors.height = "Please enter a valid height (1-300 cm)";
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight <= 0 || weight > 500) {
      newErrors.weight = "Please enter a valid weight (1-500 kg)";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    const age = parseInt(formData.age, 10);
    if (!formData.age || isNaN(age) || age < 13 || age > 120) {
      newErrors.age = "Please enter a valid age (13-120)";
    }

    // Only validate goal after the profile info has been provided (and BMI shown).
    if (isProfileComplete && !formData.goal) {
      newErrors.goal = "Please select your fitness goal";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) onNext();
    else setErrors(newErrors);
  };

  return (
    <div className="signup-step">
      <h2>Your Profile Information</h2>
      <p className="step-description">
        Help us personalize your fitness journey
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm) *</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height || ""}
              onChange={handleChange}
              className={errors.height ? "error" : ""}
              placeholder="170"
              step="0.1"
              min="1"
              max="300"
            />
            {errors.height && (
              <span className="error-message">{errors.height}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight || ""}
              onChange={handleChange}
              className={errors.weight ? "error" : ""}
              placeholder="70"
              step="0.1"
              min="1"
              max="500"
            />
            {errors.weight && (
              <span className="error-message">{errors.weight}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className={errors.gender ? "error" : ""}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <span className="error-message">{errors.gender}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              className={errors.age ? "error" : ""}
              placeholder="25"
              min="13"
              max="120"
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>
        </div>

        {/* BMI section appears after the required profile fields have values */}
        {isProfileComplete && bmiInfo && (
          <div className="form-group">
            <label>BMI Information</label>
            <div
              className="bmi-card"
              style={{
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#f9fafb",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                BMI: {bmiInfo.bmi.toFixed(1)}
              </div>
              <div style={{ marginTop: 6 }}>
                <strong>{bmiInfo.category}</strong>
              </div>
              <div style={{ marginTop: 6 }}>{bmiInfo.advice}</div>
            </div>
          </div>
        )}

        {/* Goal selection only appears after BMI is available */}
        {isProfileComplete && bmiInfo && (
          <div className="form-group">
            <label htmlFor="goal">Fitness Goal *</label>
            <select
              id="goal"
              name="goal"
              value={formData.goal || ""}
              onChange={handleChange}
              className={errors.goal ? "error" : ""}
            >
              <option value="">Select your goal...</option>
              <option value="weight_loss">Lose Weight</option>
              <option value="weight_gain">Gain Muscle</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {errors.goal && (
              <span className="error-message">{errors.goal}</span>
            )}
          </div>
        )}

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

export default SignupStep2;

import React, { useState } from "react";

const SignupStep2 = ({ onNext, onBack, formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.goal) {
      newErrors.goal = "Please select your fitness goal";
    }

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

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 13 || age > 120) {
      newErrors.age = "Please enter a valid age (13-120)";
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

  return (
    <div className="signup-step">
      <h2>Your Profile Information</h2>
      <p className="step-description">
        Help us personalize your fitness journey
      </p>

      <form onSubmit={handleSubmit}>
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
          {errors.goal && <span className="error-message">{errors.goal}</span>}
        </div>

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

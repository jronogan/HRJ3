import React, { use, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import SignupStep3 from "./SignupStep3";
import SignupStep4 from "./SignupStep4";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userCtx = use(UserContext);
  const fetchData = useMemo(
    () =>
      sharedFetch({
        setAccessToken: userCtx.setAccessToken,
        onAuthError: () => {
          localStorage.removeItem("refreshToken");
          userCtx.setAccessToken("");
        },
      }),
    [userCtx]
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    goal: "",
    height: "",
    weight: "",
    gender: "",
    age: "",
    nutritionGoal: {
      caloriesPerDay: "",
      proteinGramsPerDay: "",
      carbsGramsPerDay: "",
      fatsGramsPerDay: "",
    },
    workoutGoal: {
      daysPerWeek: 0,
      schedule: {
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        sunday: {},
      },
    },
  });

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
    setError("");
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        goal: formData.goal,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        age: parseInt(formData.age),
        nutritionGoal: {
          caloriesPerDay: parseFloat(formData.nutritionGoal.caloriesPerDay),
          proteinGramsPerDay: parseFloat(
            formData.nutritionGoal.proteinGramsPerDay
          ),
          carbsGramsPerDay: parseFloat(formData.nutritionGoal.carbsGramsPerDay),
          fatsGramsPerDay: parseFloat(formData.nutritionGoal.fatsGramsPerDay),
        },
        workoutGoal: {
          daysPerWeek: formData.workoutGoal.daysPerWeek,
          schedule: formData.workoutGoal.schedule,
        },
      };

      const registerRes = await fetchData(
        "/users/register",
        "POST",
        registrationData
      );
      if (!registerRes.ok) {
        throw new Error(registerRes.msg || "Registration failed");
      }

      // Now login the user
      const loginRes = await fetchData("/users/login", "POST", {
        email: formData.email,
        password: formData.password,
      });

      if (!loginRes.ok) {
        throw new Error(
          "Registration successful, but login failed. Please login manually."
        );
      }

      const loginData = loginRes.data;
      const access =
        loginData?.access ?? loginData?.accessToken ?? loginData?.token;
      const refresh = loginData?.refresh ?? loginData?.refreshToken;
      if (!access) {
        throw new Error(
          "Registration successful, but no access token was returned from login."
        );
      }

      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
      }

      userCtx.setAccessToken(access);
      if (loginData?.role) userCtx.setRole(loginData.role);

      navigate("/fitness");
    } catch (err) {
      setError(err.message || "An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupStep1
            onNext={handleNextStep}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <SignupStep2
            onNext={handleNextStep}
            onBack={handlePrevStep}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <SignupStep3
            onNext={handleNextStep}
            onBack={handlePrevStep}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <SignupStep4
            onSubmit={handleSubmit}
            onBack={handlePrevStep}
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Welcome to Your Fitness Journey</h1>
          <div className="progress-indicator">
            <div className="progress-steps">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`progress-step ${
                    step === currentStep
                      ? "active"
                      : step < currentStep
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && "Account"}
                    {step === 2 && "Profile"}
                    {step === 3 && "Nutrition"}
                    {step === 4 && "Workout"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="registration-content">{renderStep()}</div>

        <div className="registration-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;

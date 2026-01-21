// recommendations.js

export function activityFactor(level) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    default:
      return 1.375; // sensible default
  }
}

// Mifflin-St Jeor (needs gender)
export function calcBmr({ gender, weightKg, heightCm, age }) {
  const s = gender === "male" ? 5 : gender === "female" ? -161 : -78;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export function goalCalorieMultiplier(goal, bmiCategory) {
  if (goal === "weight_loss") {
    // slightly larger deficit for higher risk category
    return bmiCategory === "OBESE" ? 0.78 : 0.85;
  }
  if (goal === "weight_gain") return 1.1;
  return 1.0; // maintenance
}

export function macroSuggestion({
  calories,
  weightKg,
  goal,
  bmiCategory,
  age,
}) {
  // Protein anchor (higher for fat loss, older adults, and Asian visceral-fat risk)
  let proteinPerKg =
    goal === "weight_gain" ? 2.0 : goal === "weight_loss" ? 2.0 : 1.8;

  if (age >= 50) proteinPerKg = Math.max(proteinPerKg, 2.0);
  if (bmiCategory === "OBESE" || bmiCategory === "OVERWEIGHT") {
    proteinPerKg = Math.max(proteinPerKg, 2.0);
  }

  const proteinG = Math.round(weightKg * proteinPerKg);

  // Fat anchor
  const fatPerKg = goal === "weight_loss" ? 0.7 : 0.8;
  const fatG = Math.round(weightKg * fatPerKg);

  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;

  const remaining = Math.max(calories - (proteinCals + fatCals), 0);
  const carbsG = Math.round(remaining / 4);

  return { proteinG, carbsG, fatG };
}

export function workoutSuggestion({ goal, bmiCategory, age }) {
  // default weekly days, user can adjust later
  if (bmiCategory === "OBESE") {
    return {
      daysPerWeek: 3,
      notes: [
        "Start with low-impact cardio most days (walk/cycle/swim)",
        "2–3 full-body strength sessions/week, focus on form",
      ],
    };
  }

  if (goal === "weight_loss") {
    return {
      daysPerWeek: 4,
      notes: ["3 strength sessions + 1 cardio session", "Aim 8k–12k steps/day"],
    };
  }

  if (goal === "weight_gain") {
    return {
      daysPerWeek: 5,
      notes: ["4 strength sessions + 1 light cardio/mobility day"],
    };
  }

  // maintenance / recomposition
  let days = 4;
  if (age >= 50) days = 3;

  return {
    daysPerWeek: days,
    notes: ["3 strength sessions + 1 cardio/mobility day"],
  };
}

export function buildRecommendationKey(profile) {
  // Used to avoid overriding user edits / avoid loops
  const parts = [
    profile.age,
    profile.gender,
    profile.heightCm,
    profile.weightKg,
    profile.goal,
    profile.bmiCategory,
    profile.activityLevel || "light",
  ];
  return parts.join("|");
}

export function getRecommendations(formData) {
  const age = Number.parseInt(formData.age, 10);
  const heightCm = Number.parseFloat(formData.height);
  const weightKg = Number.parseFloat(formData.weight);
  const gender = formData.gender;
  const goal = formData.goal;
  const bmiCategory = formData.bmiCategory; // ✅ comes from Step2

  if (
    !Number.isFinite(age) ||
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    !gender ||
    !goal ||
    !bmiCategory
  ) {
    return null;
  }

  const bmr = calcBmr({ gender, weightKg, heightCm, age });
  const af = activityFactor(formData.activityLevel || "light");
  const tdee = bmr * af;

  const calories = Math.round(tdee * goalCalorieMultiplier(goal, bmiCategory));
  const macros = macroSuggestion({
    calories,
    weightKg,
    goal,
    bmiCategory,
    age,
  });
  const workout = workoutSuggestion({ goal, bmiCategory, age });

  const recommendationKey = buildRecommendationKey({
    age,
    gender,
    heightCm,
    weightKg,
    goal,
    bmiCategory,
    activityLevel: formData.activityLevel || "light",
  });

  return {
    recommendationKey,
    calories,
    macros,
    workout,
    tdee: Math.round(tdee),
  };
}

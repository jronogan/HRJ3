export const toLocalISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const sumNutritionLog = (log) => {
  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const items = Array.isArray(log?.foodItems) ? log.foodItems : [];

  for (const item of items) {
    totals.calories += safeNumber(item?.calories);
    totals.protein += safeNumber(item?.protein);
    totals.carbs += safeNumber(item?.carbs);
    totals.fats += safeNumber(item?.fats);
  }

  return totals;
};

export const sumWorkoutLog = (log) => {
  const exercises = Array.isArray(log?.exercises) ? log.exercises : [];
  const byMuscleGroup = new Map();

  for (const ex of exercises) {
    const muscleGroup = String(ex?.muscleGroup || "other");
    const sets = safeNumber(ex?.sets);
    const reps = safeNumber(ex?.repetitions);

    const prev = byMuscleGroup.get(muscleGroup) || { sets: 0, reps: 0 };
    byMuscleGroup.set(muscleGroup, {
      sets: prev.sets + sets,
      reps: prev.reps + reps,
    });
  }

  return byMuscleGroup;
};

export const weekdayKeyForDate = (isoDate) => {
  const d = new Date(isoDate + "T00:00:00");
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return keys[d.getDay()];
};

export const formatWord = (word) => {
  // Defensive: handle null/undefined/non-strings and normalize extra whitespace.
  // ?? used when false, 0, or "" are valid values
  const s = String(word ?? "").trim();
  if (!s) return "";

  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

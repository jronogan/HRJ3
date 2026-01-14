import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import WorkoutGoal from "../models/WorkoutGoal.js";
import NutritionGoal from "../models/NutritionGoal.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";

const requiredEnv = ["MONGO_URI"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Start fresh
  await Promise.all([
    User.deleteMany({}),
    WorkoutGoal.deleteMany({}),
    NutritionGoal.deleteMany({}),
    WorkoutLog.deleteMany({}),
    NutritionLog.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("password123", 12);

  // Users
  const [alice, bob] = await User.create([
    {
      name: "Alice Runner",
      email: "alice@example.com",
      password: passwordHash,
      goal: "maintenance",
      height: 168,
      weight: 62,
      gender: "female",
      age: 28,
    },
    {
      name: "Bob Lifter",
      email: "bob@example.com",
      password: passwordHash,
      goal: "weight_gain",
      height: 182,
      weight: 86,
      gender: "male",
      age: 31,
    },
  ]);

  // Goals
  const [aliceWorkoutGoal, bobWorkoutGoal] = await WorkoutGoal.create([
    {
      userId: alice._id,
      daysPerWeek: 3,
      schedule: {
        monday: { muscleGroups: ["cardio"] },
        wednesday: { muscleGroups: ["core"] },
        friday: { muscleGroups: ["legs", "cardio"] },
      },
    },
    {
      userId: bob._id,
      daysPerWeek: 5,
      schedule: {
        monday: { muscleGroups: ["chest", "triceps"] },
        tuesday: { muscleGroups: ["back", "biceps"] },
        thursday: { muscleGroups: ["legs"] },
        friday: { muscleGroups: ["shoulders", "core"] },
      },
    },
  ]);

  const [aliceNutritionGoal, bobNutritionGoal] = await NutritionGoal.create([
    {
      userId: alice._id,
      caloriesPerDay: 2000,
      proteinGramsPerDay: 120,
      carbsGramsPerDay: 220,
      fatsGramsPerDay: 55,
      recommendedCaloriesPerDay: 1950,
      recommendationMeta: {
        formula: "placeholder",
        computedAt: new Date(),
      },
    },
    {
      userId: bob._id,
      caloriesPerDay: 2900,
      proteinGramsPerDay: 180,
      carbsGramsPerDay: 320,
      fatsGramsPerDay: 80,
      recommendedCaloriesPerDay: 2800,
      recommendationMeta: {
        formula: "placeholder",
        computedAt: new Date(),
      },
    },
  ]);

  // Logs
  await WorkoutLog.create([
    {
      userId: alice._id,
      exercises: [
        {
          name: "Treadmill Running",
          muscleGroup: "cardio",
          sets: 1,
          repetitions: 30,
        },
        { name: "Plank", muscleGroup: "core", sets: 3, repetitions: 60 },
      ],
    },
    {
      userId: bob._id,
      exercises: [
        { name: "Bench Press", muscleGroup: "chest", sets: 5, repetitions: 5 },
        {
          name: "Tricep Pushdown",
          muscleGroup: "triceps",
          sets: 3,
          repetitions: 12,
        },
      ],
    },
  ]);

  await NutritionLog.create([
    {
      userId: alice._id,
      meal: "breakfast",
      foodItems: [
        { name: "Oatmeal", calories: 300, protein: 10, carbs: 55, fats: 6 },
        { name: "Greek Yogurt", calories: 120, protein: 16, carbs: 6, fats: 0 },
      ],
    },
    {
      userId: bob._id,
      meal: "dinner",
      foodItems: [
        {
          name: "Chicken Breast",
          calories: 250,
          protein: 45,
          carbs: 0,
          fats: 5,
        },
        { name: "Rice", calories: 350, protein: 7, carbs: 75, fats: 1 },
      ],
    },
  ]);

  console.log("Seed complete");
  console.log(
    JSON.stringify(
      {
        users: [alice, bob].map((u) => ({
          id: u._id.toString(),
          email: u.email,
        })),
        workoutGoals: [aliceWorkoutGoal, bobWorkoutGoal].map((g) =>
          g._id.toString()
        ),
        nutritionGoals: [aliceNutritionGoal, bobNutritionGoal].map((g) =>
          g._id.toString()
        ),
        loginPassword: "password123",
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

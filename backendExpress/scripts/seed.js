import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import WorkoutGoal from "../models/WorkoutGoal.js";
import NutritionGoal from "../models/NutritionGoal.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";
// import WorkoutExercise from "../models/WorkoutExercises.js";

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
    // WorkoutExercise.deleteMany({}),
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
        wednesday: { muscleGroups: ["waist"] },
        friday: { muscleGroups: ["upper legs", "cardio"] },
      },
    },
    {
      userId: bob._id,
      daysPerWeek: 5,
      schedule: {
        monday: { muscleGroups: ["chest", "upper arms"] },
        tuesday: { muscleGroups: ["back", "upper arms"] },
        thursday: { muscleGroups: ["upper legs"] },
        friday: { muscleGroups: ["shoulders", "waist"] },
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

  // Exercise library
  // const [pushUp, barbellBench, plank] = await WorkoutExercise.create([
  //   {
  //     exerciseName: "Push-up",
  //     exerciseGif: "https://static.exercisedb.dev/media/push-up.gif",
  //     exerciseBodyParts: "chest",
  //     instructions:
  //       "Start in a high plank. Lower your body until your chest is close to the floor, then press back up.",
  //     equipment: "body weight",
  //   },
  //   {
  //     exerciseName: "Barbell Bench Press",
  //     exerciseGif: "https://static.exercisedb.dev/media/bench-press.gif",
  //     exerciseBodyParts: "chest",
  //     instructions:
  //       "Lie on a bench. Unrack the bar, lower it to your mid-chest with control, then press to lockout.",
  //     equipment: "barbell",
  //   },
  //   {
  //     exerciseName: "Plank",
  //     exerciseGif: "https://static.exercisedb.dev/media/plank.gif",
  //     exerciseBodyParts: "waist",
  //     instructions:
  //       "Hold a straight line from head to heels, bracing your core. Avoid sagging hips.",
  //     equipment: "body weight",
  //   },
  // ]);

  // Logs
  const workoutLogs = await WorkoutLog.create([
    {
      userId: alice._id,
      exercises: [
        {
          name: "Treadmill Running",
          muscleGroup: "cardio",
          weight: 0,
          sets: 1,
          repetitions: 30,
        },
        {
          name: "Plank",
          muscleGroup: "waist",
          weight: 0,
          sets: 3,
          repetitions: 60,
        },
      ],
    },
    {
      userId: bob._id,
      exercises: [
        {
          name: "Bench Press",
          muscleGroup: "chest",
          weight: 185,
          sets: 5,
          repetitions: 5,
        },
        {
          name: "Tricep Pushdown",
          muscleGroup: "upper arms",
          weight: 60,
          sets: 3,
          repetitions: 12,
        },
      ],
    },
  ]);

  const nutritionLogs = await NutritionLog.create([
    {
      userId: alice._id,
      foodItems: [
        {
          meal: "breakfast",
          name: "Oatmeal",
          amount: "1 bowl",
          calories: 300,
          protein: 10,
          carbs: 55,
          fats: 6,
        },
        {
          meal: "breakfast",
          name: "Greek Yogurt",
          amount: "1 cup",
          calories: 120,
          protein: 16,
          carbs: 6,
          fats: 0,
        },
      ],
    },
    {
      userId: bob._id,
      foodItems: [
        {
          meal: "dinner",
          name: "Chicken Breast",
          amount: "200g",
          calories: 250,
          protein: 45,
          carbs: 0,
          fats: 5,
        },
        {
          meal: "dinner",
          name: "Rice",
          amount: "1.5 cups",
          calories: 350,
          protein: 7,
          carbs: 75,
          fats: 1,
        },
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
        workoutLogs: workoutLogs.map((l) => l._id.toString()),
        nutritionLogs: nutritionLogs.map((l) => l._id.toString()),
        workoutGoals: [aliceWorkoutGoal, bobWorkoutGoal].map((g) =>
          g._id.toString(),
        ),
        nutritionGoals: [aliceNutritionGoal, bobNutritionGoal].map((g) =>
          g._id.toString(),
        ),
        loginPassword: "password123",
      },
      null,
      2,
    ),
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

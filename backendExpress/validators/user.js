import { body } from "express-validator";

const goalValues = ["weight_loss", "weight_gain", "maintenance"];
const genderValues = ["male", "female", "other"];
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const muscleGroupValues = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "biceps",
  "triceps",
  "core",
  "cardio",
  "full_body",
  "other",
];

export const validateUserRegister = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email is required"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("goal")
    .isIn(goalValues)
    .withMessage(`goal must be one of: ${goalValues.join(", ")}`),
  body("height")
    .isNumeric()
    .withMessage("height must be a number")
    .custom((v) => Number(v) > 0)
    .withMessage("height must be > 0"),
  body("weight")
    .isNumeric()
    .withMessage("weight must be a number")
    .custom((v) => Number(v) > 0)
    .withMessage("weight must be > 0"),
  body("gender")
    .isIn(genderValues)
    .withMessage(`gender must be one of: ${genderValues.join(", ")}`),
  body("age").isInt({ min: 1 }).withMessage("age must be a positive integer"),

  // workoutGoal (required for your new flow)
  body("workoutGoal").isObject().withMessage("workoutGoal is required"),
  body("workoutGoal.daysPerWeek")
    .isInt({ min: 0, max: 7 })
    .withMessage("workoutGoal.daysPerWeek must be 0-7"),
  body("workoutGoal.schedule")
    .optional()
    .isObject()
    .withMessage("workoutGoal.schedule must be an object"),
  ...days.flatMap((day) => [
    body(`workoutGoal.schedule.${day}.muscleGroups`)
      .optional()
      .isArray()
      .withMessage(`${day} muscleGroups must be an array`),
    body(`workoutGoal.schedule.${day}.muscleGroups.*`)
      .optional()
      .isIn(muscleGroupValues)
      .withMessage(`invalid muscle group for ${day}`),
  ]),

  // nutritionGoal (required for your new flow)
  body("nutritionGoal").isObject().withMessage("nutritionGoal is required"),
  body("nutritionGoal.caloriesPerDay")
    .isInt({ min: 0 })
    .withMessage("nutritionGoal.caloriesPerDay must be a positive integer"),
  body("nutritionGoal.proteinGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("nutritionGoal.proteinGramsPerDay must be a positive integer"),
  body("nutritionGoal.carbsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("nutritionGoal.carbsGramsPerDay must be a positive integer"),
  body("nutritionGoal.fatsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("nutritionGoal.fatsGramsPerDay must be a positive integer"),
];

export const validateUserLogin = [
  body("email").isEmail().withMessage("valid email is required"),
  body("password").notEmpty().withMessage("password is required"),
];

export const validateUserRefresh = [];

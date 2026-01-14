import { body, param } from "express-validator";
import { muscleGroupValues } from "../models/WorkoutGoal.js";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const validateWorkoutGoalIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateWorkoutGoalUserIdParam = [
  param("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
];

const scheduleValidators = days.flatMap((day) => [
  body(`schedule.${day}.muscleGroups`)
    .optional()
    .isArray()
    .withMessage(`${day} muscleGroups must be an array`),
  body(`schedule.${day}.muscleGroups.*`)
    .optional()
    .isIn(muscleGroupValues)
    .withMessage(`invalid muscle group for ${day}`),
]);

export const validateWorkoutGoalCreate = [
  body("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("daysPerWeek")
    .isInt({ min: 0, max: 7 })
    .withMessage("daysPerWeek must be an integer between 0 and 7"),
  body("schedule")
    .optional()
    .isObject()
    .withMessage("schedule must be an object"),
  ...scheduleValidators,
];

export const validateWorkoutGoalUpdate = [
  body("daysPerWeek")
    .optional()
    .isInt({ min: 0, max: 7 })
    .withMessage("daysPerWeek must be an integer between 0 and 7"),
  body("schedule")
    .optional()
    .isObject()
    .withMessage("schedule must be an object"),
  ...scheduleValidators,
];

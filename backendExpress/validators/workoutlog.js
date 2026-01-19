import { body, param } from "express-validator";

export const validateWorkoutLogIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateWorkoutLogUserIdParam = [
  param("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
];

export const validateWorkoutLogCreate = [
  body("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("exercises")
    .isArray({ min: 1 })
    .withMessage("exercises must be a non-empty array"),
  body("exercises.*.name")
    .trim()
    .notEmpty()
    .withMessage("exercise name is required"),
  body("exercises.*.muscleGroup")
    .trim()
    .notEmpty()
    .withMessage("exercise muscleGroup is required"),
  body("exercises.*.weight")
    .isNumeric()
    .withMessage("exercise weight must be a number"),
  body("exercises.*.sets")
    .isInt({ min: 1 })
    .withMessage("exercise sets must be an integer >= 1"),
  body("exercises.*.repetitions")
    .isInt({ min: 1 })
    .withMessage("exercise repetitions must be an integer >= 1"),
];

export const validateWorkoutLogUpdate = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("exercises")
    .optional()
    .isArray({ min: 1 })
    .withMessage("exercises must be a non-empty array"),
  body("exercises.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("exercise name is required"),
  body("exercises.*.muscleGroup")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("exercise muscleGroup is required"),
  body("exercises.*.weight")
    .optional()
    .isNumeric()
    .withMessage("exercise weight must be a number"),
  body("exercises.*.sets")
    .optional()
    .isInt({ min: 1 })
    .withMessage("exercise sets must be an integer >= 1"),
  body("exercises.*.repetitions")
    .optional()
    .isInt({ min: 1 })
    .withMessage("exercise repetitions must be an integer >= 1"),
];

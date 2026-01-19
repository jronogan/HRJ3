import { body, param } from "express-validator";

const bodyPartValues = [
  "lower arms",
  "shoulders",
  "cardio",
  "upper arms",
  "chest",
  "lower legs",
  "back",
  "upper legs",
  "waist",
];

export const validateWorkoutExerciseIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateWorkoutExerciseBodyPartParam = [
  param("part")
    .trim()
    .isIn(bodyPartValues)
    .withMessage(`part must be one of: ${bodyPartValues.join(", ")}`),
];

export const validateWorkoutExerciseCreate = [
  body("exerciseName")
    .trim()
    .notEmpty()
    .withMessage("exerciseName is required"),
  body("exerciseGif").trim().notEmpty().withMessage("exerciseGif is required"),
  body("exerciseBodyParts")
    .isIn(bodyPartValues)
    .withMessage(
      `exerciseBodyParts must be one of: ${bodyPartValues.join(", ")}`,
    ),
  body("instructions")
    .trim()
    .notEmpty()
    .withMessage("instructions is required"),
  body("equipment").trim().notEmpty().withMessage("equipment is required"),
];

export const validateWorkoutExerciseUpdate = [
  body("exerciseName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("exerciseName cannot be empty"),
  body("exerciseGif")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("exerciseGif cannot be empty"),
  body("exerciseBodyParts")
    .optional()
    .isIn(bodyPartValues)
    .withMessage(
      `exerciseBodyParts must be one of: ${bodyPartValues.join(", ")}`,
    ),
  body("instructions")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("instructions cannot be empty"),
  body("equipment")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("equipment cannot be empty"),
];

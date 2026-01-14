import { body, param } from "express-validator";

export const validateNutritionGoalIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateNutritionGoalUserIdParam = [
  param("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
];

export const validateNutritionGoalCreate = [
  body("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("caloriesPerDay")
    .isInt({ min: 0 })
    .withMessage("caloriesPerDay must be a positive integer"),
  body("proteinGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("proteinGramsPerDay must be a positive integer"),
  body("carbsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("carbsGramsPerDay must be a positive integer"),
  body("fatsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("fatsGramsPerDay must be a positive integer"),
];

export const validateNutritionGoalUpdate = [
  body("caloriesPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("caloriesPerDay must be a positive integer"),
  body("proteinGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("proteinGramsPerDay must be a positive integer"),
  body("carbsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("carbsGramsPerDay must be a positive integer"),
  body("fatsGramsPerDay")
    .optional()
    .isInt({ min: 0 })
    .withMessage("fatsGramsPerDay must be a positive integer"),
];

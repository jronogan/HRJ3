import { body, param } from "express-validator";

const mealValues = ["breakfast", "lunch", "dinner", "snack"];

export const validateNutritionLogIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateNutritionLogCreate = [
  body("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("meal")
    .isIn(mealValues)
    .withMessage(`meal must be one of: ${mealValues.join(", ")}`),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("foodItems")
    .isArray({ min: 1 })
    .withMessage("foodItems must be a non-empty array"),
  body("foodItems.*.name")
    .trim()
    .notEmpty()
    .withMessage("food item name is required"),
  body("foodItems.*.calories")
    .optional()
    .isNumeric()
    .withMessage("calories must be a number"),
  body("foodItems.*.protein")
    .optional()
    .isNumeric()
    .withMessage("protein must be a number"),
  body("foodItems.*.carbs")
    .optional()
    .isNumeric()
    .withMessage("carbs must be a number"),
  body("foodItems.*.fats")
    .optional()
    .isNumeric()
    .withMessage("fats must be a number"),
];

export const validateNutritionLogUpdate = [
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("meal")
    .optional()
    .isIn(mealValues)
    .withMessage(`meal must be one of: ${mealValues.join(", ")}`),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("foodItems")
    .optional()
    .isArray({ min: 1 })
    .withMessage("foodItems must be a non-empty array"),
  body("foodItems.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("food item name is required"),
  body("foodItems.*.calories")
    .optional()
    .isNumeric()
    .withMessage("calories must be a number"),
  body("foodItems.*.protein")
    .optional()
    .isNumeric()
    .withMessage("protein must be a number"),
  body("foodItems.*.carbs")
    .optional()
    .isNumeric()
    .withMessage("carbs must be a number"),
  body("foodItems.*.fats")
    .optional()
    .isNumeric()
    .withMessage("fats must be a number"),
];

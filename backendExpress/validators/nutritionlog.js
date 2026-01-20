import { body, param } from "express-validator";

const mealValues = ["breakfast", "lunch", "dinner", "snack"];

export const validateNutritionLogIdParam = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateUserIdParam = [
  param("userId").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const validateNutritionLogFoodItemParams = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
  param("foodItemId")
    .isMongoId()
    .withMessage("foodItemId must be a valid Mongo ObjectId"),
];

export const validateNutritionLogFoodItemPatch = [
  body("meal")
    .optional()
    .isIn(mealValues)
    .withMessage(`meal must be one of: ${mealValues.join(", ")}`),
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("amount")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("amount cannot be empty"),
  body("calories")
    .optional()
    .isNumeric()
    .withMessage("calories must be a number"),
  body("protein")
    .optional()
    .isNumeric()
    .withMessage("protein must be a number"),
  body("carbs").optional().isNumeric().withMessage("carbs must be a number"),
  body("fats").optional().isNumeric().withMessage("fats must be a number"),
];

export const validateNutritionLogCreate = [
  body("userId")
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("foodItems")
    .isArray({ min: 1 })
    .withMessage("foodItems must be a non-empty array"),
  body("foodItems.*.meal")
    .isIn(mealValues)
    .withMessage(`foodItems meal must be one of: ${mealValues.join(", ")}`),
  body("foodItems.*.name")
    .trim()
    .notEmpty()
    .withMessage("food item name is required"),
  body("foodItems.*.amount")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("amount cannot be empty"),
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
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("foodItems")
    .optional()
    .isArray({ min: 1 })
    .withMessage("foodItems must be a non-empty array"),
  body("foodItems.*.meal")
    .optional()
    .isIn(mealValues)
    .withMessage(`foodItems meal must be one of: ${mealValues.join(", ")}`),
  body("foodItems.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("food item name is required"),
  body("foodItems.*.amount")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("amount cannot be empty"),
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

// PATCH /nutritionlogs/:id
// Intended for top-level edits like meal/date (and optionally userId).
// We explicitly reject foodItems here to avoid accidental array replacement.
export const validateNutritionLogPatch = [
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("userId must be a valid Mongo ObjectId"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  body("foodItems")
    .not()
    .exists()
    .withMessage(
      "foodItems cannot be patched via PATCH /nutritionlogs/:id. Use PATCH /nutritionlogs/:id/fooditems/:foodItemId or PUT /nutritionlogs/:id."
    ),
];

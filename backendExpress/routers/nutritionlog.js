import express from "express";
import {
  createNutritionLog,
  deleteNutritionLog,
  deleteNutritionLogFoodItem,
  getNutritionLogById,
  getNutritionLogs,
  getNutritionLogsByUserId,
  patchNutritionLog,
  updateNutritionLogFoodItem,
} from "../controllers/nutritionlog.js";
import { validate } from "../validators/validate.js";
import {
  validateNutritionLogCreate,
  validateNutritionLogFoodItemParams,
  validateNutritionLogFoodItemPatch,
  validateNutritionLogIdParam,
  validateNutritionLogPatch,
  validateNutritionLogUpdate,
  validateUserIdParam,
} from "../validators/nutritionlog.js";
import { isSignedIn } from "../middleware/is-signed-in.js";

const router = express.Router();

router.get("/", isSignedIn, getNutritionLogs);
router.get(
  "/:id",
  isSignedIn,
  validateNutritionLogIdParam,
  validate,
  getNutritionLogById
);
router.get(
  "/users/:userId",
  isSignedIn,
  validateUserIdParam,
  validate,
  getNutritionLogsByUserId
);
router.post(
  "/",
  isSignedIn,
  validateNutritionLogCreate,
  validate,
  createNutritionLog
);
router.patch(
  "/:id",
  isSignedIn,
  validateNutritionLogIdParam,
  validateNutritionLogPatch,
  validate,
  patchNutritionLog
);
router.patch(
  "/:id/fooditems/:foodItemId",
  isSignedIn,
  validateNutritionLogFoodItemParams,
  validateNutritionLogFoodItemPatch,
  validate,
  updateNutritionLogFoodItem
);
router.delete(
  "/:id",
  isSignedIn,
  validateNutritionLogIdParam,
  validate,
  deleteNutritionLog
);
router.delete(
  "/:id/fooditems/:foodItemId",
  isSignedIn,
  validateNutritionLogFoodItemParams,
  validate,
  deleteNutritionLogFoodItem
);

export default router;

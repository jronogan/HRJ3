import express from "express";
import {
  createNutritionGoal,
  deleteNutritionGoal,
  getNutritionGoalById,
  getNutritionGoalByUserId,
  getNutritionGoals,
  updateNutritionGoal,
} from "../controllers/nutritiongoal.js";
import { isSignedIn } from "../middleware/is-signed-in.js";
import { validate } from "../validators/validate.js";
import {
  validateNutritionGoalCreate,
  validateNutritionGoalIdParam,
  validateNutritionGoalUpdate,
  validateNutritionGoalUserIdParam,
} from "../validators/nutritiongoal.js";

const router = express.Router();

router.get("/", isSignedIn, getNutritionGoals);
router.get(
  "/:id",
  isSignedIn,
  validateNutritionGoalIdParam,
  validate,
  getNutritionGoalById
);
router.get(
  "/user/:userId",
  isSignedIn,
  validateNutritionGoalUserIdParam,
  validate,
  getNutritionGoalByUserId
);
router.post(
  "/",
  isSignedIn,
  validateNutritionGoalCreate,
  validate,
  createNutritionGoal
);
router.put(
  "/:id",
  isSignedIn,
  validateNutritionGoalIdParam,
  validateNutritionGoalUpdate,
  validate,
  updateNutritionGoal
);
router.delete(
  "/:id",
  isSignedIn,
  validateNutritionGoalIdParam,
  validate,
  deleteNutritionGoal
);

export default router;

import express from "express";
import {
  createNutritionLog,
  deleteNutritionLog,
  getNutritionLogById,
  getNutritionLogs,
  updateNutritionLog,
} from "../controllers/nutritionlog.js";
import { validate } from "../validators/validate.js";
import {
  validateNutritionLogCreate,
  validateNutritionLogIdParam,
  validateNutritionLogUpdate,
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
router.post(
  "/",
  isSignedIn,
  validateNutritionLogCreate,
  validate,
  createNutritionLog
);
router.put(
  "/:id",
  isSignedIn,
  validateNutritionLogIdParam,
  validateNutritionLogUpdate,
  validate,
  updateNutritionLog
);
router.delete(
  "/:id",
  isSignedIn,
  validateNutritionLogIdParam,
  validate,
  deleteNutritionLog
);

export default router;

import express from "express";
import {
  createWorkoutGoal,
  deleteWorkoutGoal,
  getWorkoutGoalById,
  getWorkoutGoalByUserId,
  getWorkoutGoals,
  updateWorkoutGoal,
  updateWorkoutGoalByDay,
} from "../controllers/workoutgoal.js";
import { isSignedIn } from "../middleware/is-signed-in.js";
import { validate } from "../validators/validate.js";
import {
  validateWorkoutGoalCreate,
  validateWorkoutGoalIdParam,
  validateWorkoutGoalUpdate,
  validateWorkoutGoalUserIdParam,
} from "../validators/workoutgoal.js";

const router = express.Router();

router.get("/", isSignedIn, getWorkoutGoals);
router.get(
  "/:id",
  isSignedIn,
  validateWorkoutGoalIdParam,
  validate,
  getWorkoutGoalById
);
router.get(
  "/user/:userId",
  isSignedIn,
  validateWorkoutGoalUserIdParam,
  validate,
  getWorkoutGoalByUserId
);
router.post(
  "/",
  isSignedIn,
  validateWorkoutGoalCreate,
  validate,
  createWorkoutGoal
);
router.put(
  "/:id",
  isSignedIn,
  validateWorkoutGoalIdParam,
  validateWorkoutGoalUpdate,
  validate,
  updateWorkoutGoal
);
router.put(
  "/:id/day",
  isSignedIn,
  validateWorkoutGoalIdParam,
  validate,
  updateWorkoutGoalByDay
);
router.delete(
  "/:id",
  isSignedIn,
  validateWorkoutGoalIdParam,
  validate,
  deleteWorkoutGoal
);

export default router;

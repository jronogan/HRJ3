import express from "express";
import {
  createWorkoutLog,
  deleteWorkoutLog,
  getWorkoutLogs,
  getWorkoutLogsByUserId,
  updateWorkoutLog,
} from "../controllers/workoutlog.js";
import { validate } from "../validators/validate.js";
import {
  validateWorkoutLogCreate,
  validateWorkoutLogIdParam,
  validateWorkoutLogUpdate,
  validateWorkoutLogUserIdParam,
} from "../validators/workoutlog.js";
import { isSignedIn } from "../middleware/is-signed-in.js";

const router = express.Router();

router.get("/", isSignedIn, getWorkoutLogs);
router.get(
  "/user/:userId",
  isSignedIn,
  validateWorkoutLogUserIdParam,
  validate,
  getWorkoutLogsByUserId,
);
router.post(
  "/",
  isSignedIn,
  validateWorkoutLogCreate,
  validate,
  createWorkoutLog,
);
router.delete(
  "/:id",
  isSignedIn,
  validateWorkoutLogIdParam,
  validate,
  deleteWorkoutLog,
);
router.patch(
  "/:id",
  isSignedIn,
  validateWorkoutLogIdParam,
  validateWorkoutLogUpdate,
  validate,
  updateWorkoutLog,
);

export default router;

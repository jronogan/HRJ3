import express from "express";
import {
  createWorkoutExercise,
  deleteWorkoutExercise,
  getWorkoutExerciseById,
  getWorkoutExerciseByPart,
  getWorkoutExercises,
  updateWorkoutExercise,
} from "../controllers/workoutexercise.js";
import { isSignedIn } from "../middleware/is-signed-in.js";
import { validate } from "../validators/validate.js";
import {
  validateWorkoutExerciseCreate,
  validateWorkoutExerciseBodyPartParam,
  validateWorkoutExerciseIdParam,
  validateWorkoutExerciseUpdate,
} from "../validators/workoutexercise.js";

const router = express.Router();

router.get("/", getWorkoutExercises);
router.get(
  "/bodypart/:part",
  validateWorkoutExerciseBodyPartParam,
  validate,
  getWorkoutExerciseByPart,
);
router.get(
  "/:id",
  validateWorkoutExerciseIdParam,
  validate,
  getWorkoutExerciseById,
);
router.post(
  "/",
  isSignedIn,
  validateWorkoutExerciseCreate,
  validate,
  createWorkoutExercise,
);
router.patch(
  "/:id",
  isSignedIn,
  validateWorkoutExerciseIdParam,
  validateWorkoutExerciseUpdate,
  validate,
  updateWorkoutExercise,
);
router.delete(
  "/:id",
  isSignedIn,
  validateWorkoutExerciseIdParam,
  validate,
  deleteWorkoutExercise,
);

export default router;

import mongoose from "mongoose";

const WorkoutExerciseSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  exerciseGif: { type: String, required: true },
  exerciseBodyParts: {
    type: String,
    enum: [
      "lower arms",
      "shoulders",
      "cardio",
      "upper arms",
      "chest",
      "lower legs",
      "back",
      "upper legs",
      "waist",
    ],
    required: true,
  },
  instructions: { type: String, required: true },
  equipment: { type: String, required: true },
});

const WorkoutExercise = mongoose.model(
  "WorkoutExercise",
  WorkoutExerciseSchema,
);

export default WorkoutExercise;

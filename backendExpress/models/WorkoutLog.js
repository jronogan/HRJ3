import mongoose from "mongoose";

const WorkoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  exercises: [
    {
      name: { type: String, required: true },
      muscleGroup: {
        type: String,
        enum: [
          "chest",
          "back",
          "legs",
          "biceps",
          "triceps",
          "shoulders",
          "cardio",
          "core",
          "forearms",
        ],
        required: true,
      },
      sets: { type: Number, required: true },
      repetitions: { type: Number, required: true },
    },
  ],
});

const WorkoutLog = mongoose.model("WorkoutLog", WorkoutLogSchema);

export default WorkoutLog;

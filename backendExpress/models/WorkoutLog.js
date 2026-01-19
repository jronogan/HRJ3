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
      weight: { type: Number, optional: true },
      sets: { type: Number, required: true },
      repetitions: { type: Number, required: true },
    },
  ],
});

const WorkoutLog = mongoose.model("WorkoutLog", WorkoutLogSchema);

export default WorkoutLog;

import mongoose from "mongoose";

const muscleGroupValues = [
  "lower arms",
  "shoulders",
  "cardio",
  "upper arms",
  "chest",
  "lower legs",
  "back",
  "upper legs",
  "waist",
];

const workoutDaySchema = new mongoose.Schema(
  {
    muscleGroups: {
      type: [String],
      enum: muscleGroupValues,
      default: [],
    },
  },
  { _id: false },
);

const workoutScheduleSchema = new mongoose.Schema(
  {
    monday: { type: workoutDaySchema, default: () => ({}) },
    tuesday: { type: workoutDaySchema, default: () => ({}) },
    wednesday: { type: workoutDaySchema, default: () => ({}) },
    thursday: { type: workoutDaySchema, default: () => ({}) },
    friday: { type: workoutDaySchema, default: () => ({}) },
    saturday: { type: workoutDaySchema, default: () => ({}) },
    sunday: { type: workoutDaySchema, default: () => ({}) },
  },
  { _id: false },
);

const WorkoutGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  daysPerWeek: { type: Number, required: true, min: 0, max: 7 },
  schedule: { type: workoutScheduleSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WorkoutGoalSchema.pre("save", function () {
  this.updatedAt = new Date();
});

WorkoutGoalSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: new Date() });
});

const WorkoutGoal = mongoose.model("WorkoutGoal", WorkoutGoalSchema);

export default WorkoutGoal;
export { muscleGroupValues };

import mongoose from "mongoose";

const NutritionGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  caloriesPerDay: { type: Number, required: true, min: 0 },
  proteinGramsPerDay: { type: Number, min: 0 },
  carbsGramsPerDay: { type: Number, min: 0 },
  fatsGramsPerDay: { type: Number, min: 0 },

  // future-proof fields for your upcoming recommendation system
  recommendedCaloriesPerDay: { type: Number, min: 0 },
  recommendationMeta: {
    formula: { type: String },
    computedAt: { type: Date },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NutritionGoalSchema.pre("save", function () {
  this.updatedAt = new Date();
});

NutritionGoalSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: new Date() });
});

const NutritionGoal = mongoose.model("NutritionGoal", NutritionGoalSchema);

export default NutritionGoal;

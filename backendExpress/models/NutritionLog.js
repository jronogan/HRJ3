import mongoose from "mongoose";

const NutritionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodItems: [
    {
      name: { type: String, required: true },
      calories: { type: Number, optional: true },
      protein: { type: Number, optional: true },
      carbs: { type: Number, optional: true },
      fats: { type: Number, optional: true },
    },
  ],
  date: { type: Date, default: Date.now },
  meal: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true,
  },
});

const NutritionLog = mongoose.model("NutritionLog", NutritionLogSchema);

export default NutritionLog;

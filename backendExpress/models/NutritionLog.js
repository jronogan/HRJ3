import mongoose from "mongoose";

const mealValues = ["breakfast", "lunch", "dinner", "snack"];

const NutritionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodItems: [
    {
      meal: {
        type: String,
        enum: mealValues,
        required: true,
      },
      name: { type: String, required: true },
      amount: { type: String, required: false },
      calories: { type: Number, optional: true },
      protein: { type: Number, optional: true },
      carbs: { type: Number, optional: true },
      fats: { type: Number, optional: true },
    },
  ],
  date: { type: Date, default: Date.now },
});

const NutritionLog = mongoose.model("NutritionLog", NutritionLogSchema);

export default NutritionLog;

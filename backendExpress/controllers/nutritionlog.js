import NutritionLog from "../models/NutritionLog.js";

export const getNutritionLogs = async (req, res) => {
  try {
    const logs = await NutritionLog.find();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition logs" });
  }
};

export const getNutritionLogById = async (req, res) => {
  const { id } = req.params;

  try {
    const log = await NutritionLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition log" });
  }
};

export const createNutritionLog = async (req, res) => {
  const { userId, foodItems, date, meal } = req.body;

  try {
    const newLog = new NutritionLog({ userId, foodItems, date, meal });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: "Error creating nutrition log" });
  }
};

export const updateNutritionLog = async (req, res) => {
  const { id } = req.params;
  const { userId, foodItems, date, meal } = req.body;

  try {
    const updateLog = {};
    if (userId) updateLog.userId = userId;
    if (foodItems) updateLog.foodItems = foodItems;
    if (date) updateLog.date = date;
    if (meal) updateLog.meal = meal;

    const updatedLog = await NutritionLog.findByIdAndUpdate(id, updateLog, {
      new: true,
      runValidators: true,
    });

    if (!updatedLog) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: "Error updating nutrition log" });
  }
};

// Patch *top-level* fields without replacing arrays.
// Use this for changes like meal/date.
// Route shape: PATCH /nutritionlogs/:id
export const patchNutritionLog = async (req, res) => {
  const { id } = req.params;
  const { userId, date, meal, foodItems } = req.body;

  // Guardrail: patching foodItems here is almost always accidental.
  // Use PATCH /:id/fooditems/:foodItemId for per-item edits, or PUT /:id for full replacement.
  if (foodItems !== undefined) {
    return res.status(400).json({
      message:
        "foodItems cannot be patched via PATCH /nutritionlogs/:id. Use PATCH /nutritionlogs/:id/fooditems/:foodItemId or PUT /nutritionlogs/:id.",
    });
  }

  try {
    const patch = {};
    if (userId !== undefined) patch.userId = userId;
    if (date !== undefined) patch.date = date;
    if (meal !== undefined) patch.meal = meal;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const updatedLog = await NutritionLog.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    if (!updatedLog) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: "Error patching nutrition log" });
  }
};

// Patch one food item inside a log without replacing the whole foodItems array
// Route shape: PATCH /nutritionlogs/:id/fooditems/:foodItemId
export const updateNutritionLogFoodItem = async (req, res) => {
  const { id, foodItemId } = req.params;
  const { name, calories, protein, carbs, fats } = req.body;

  try {
    const setOps = {};
    if (name !== undefined) setOps["foodItems.$[item].name"] = name;
    if (calories !== undefined) setOps["foodItems.$[item].calories"] = calories;
    if (protein !== undefined) setOps["foodItems.$[item].protein"] = protein;
    if (carbs !== undefined) setOps["foodItems.$[item].carbs"] = carbs;
    if (fats !== undefined) setOps["foodItems.$[item].fats"] = fats;

    if (Object.keys(setOps).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const updatedLog = await NutritionLog.findByIdAndUpdate(
      id,
      { $set: setOps },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ "item._id": foodItemId }],
      }
    );

    if (!updatedLog) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    const updatedItem = updatedLog.foodItems?.find(
      (fi) => String(fi._id) === String(foodItemId)
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({ log: updatedLog, updatedFoodItem: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating food item" });
  }
};

export const deleteNutritionLog = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLog = await NutritionLog.findByIdAndDelete(id);
    if (!deletedLog) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }
    res.status(200).json({ message: "Nutrition log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting nutrition log" });
  }
};

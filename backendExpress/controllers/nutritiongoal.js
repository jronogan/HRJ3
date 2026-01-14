import NutritionGoal from "../models/NutritionGoal.js";

export const getNutritionGoals = async (req, res) => {
  try {
    const goals = await NutritionGoal.find();
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition goals" });
  }
};

export const getNutritionGoalById = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await NutritionGoal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Nutrition goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition goal" });
  }
};

export const getNutritionGoalByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const goal = await NutritionGoal.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ message: "Nutrition goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition goal" });
  }
};

export const createNutritionGoal = async (req, res) => {
  const {
    userId,
    caloriesPerDay,
    proteinGramsPerDay,
    carbsGramsPerDay,
    fatsGramsPerDay,
  } = req.body;

  try {
    const existing = await NutritionGoal.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Nutrition goal already exists for this user" });
    }

    const newGoal = new NutritionGoal({
      userId,
      caloriesPerDay,
      proteinGramsPerDay,
      carbsGramsPerDay,
      fatsGramsPerDay,
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: "Error creating nutrition goal" });
  }
};

export const updateNutritionGoal = async (req, res) => {
  const { id } = req.params;
  const {
    caloriesPerDay,
    proteinGramsPerDay,
    carbsGramsPerDay,
    fatsGramsPerDay,
  } = req.body;

  try {
    const updateGoal = {};
    if (caloriesPerDay !== undefined)
      updateGoal.caloriesPerDay = caloriesPerDay;
    if (proteinGramsPerDay !== undefined)
      updateGoal.proteinGramsPerDay = proteinGramsPerDay;
    if (carbsGramsPerDay !== undefined)
      updateGoal.carbsGramsPerDay = carbsGramsPerDay;
    if (fatsGramsPerDay !== undefined)
      updateGoal.fatsGramsPerDay = fatsGramsPerDay;

    const updated = await NutritionGoal.findByIdAndUpdate(id, updateGoal, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Nutrition goal not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating nutrition goal" });
  }
};

export const deleteNutritionGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await NutritionGoal.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Nutrition goal not found" });
    }
    res.status(200).json({ message: "Nutrition goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting nutrition goal" });
  }
};

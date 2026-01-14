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

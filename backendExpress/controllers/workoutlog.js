import workoutLog from "../models/WorkoutLog.js";

export const getWorkoutLogs = async (req, res) => {
  try {
    const logs = await workoutLog.find();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout logs" });
  }
};

export const createWorkoutLog = async (req, res) => {
  const { userId, date, exercises } = req.body;

  try {
    const newLog = new workoutLog({ userId, date, exercises });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: "Error creating workout log" });
  }
};

export const deleteWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLog = await workoutLog.findByIdAndDelete(id);
    if (!deletedLog) {
      return res.status(404).json({ message: "Workout log not found" });
    }
    res.status(200).json({ message: "Workout log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workout log" });
  }
};

export const updateWorkoutLog = async (req, res) => {
  const { id } = req.params;
  const { date, exercises } = req.body;

  try {
    const updateLog = {};
    if (date) updateLog.date = date;
    if (exercises) updateLog.exercises = exercises;

    const updatedLog = await workoutLog.findByIdAndUpdate(id, updateLog, {
      new: true,
    });
    if (!updatedLog) {
      return res.status(404).json({ message: "Workout log not found" });
    }
    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: "Error updating workout log" });
  }
};

import WorkoutGoal from "../models/WorkoutGoal.js";

export const getWorkoutGoals = async (req, res) => {
  try {
    const goals = await WorkoutGoal.find();
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout goals" });
  }
};

export const getWorkoutGoalById = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await WorkoutGoal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Workout goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout goal" });
  }
};

export const getWorkoutGoalByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const goal = await WorkoutGoal.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ message: "Workout goal not found" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout goal" });
  }
};

export const createWorkoutGoal = async (req, res) => {
  const { userId, daysPerWeek, schedule } = req.body;

  try {
    const existing = await WorkoutGoal.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Workout goal already exists for this user" });
    }

    const newGoal = new WorkoutGoal({ userId, daysPerWeek, schedule });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: "Error creating workout goal" });
  }
};

export const updateWorkoutGoal = async (req, res) => {
  const { id } = req.params;
  const { daysPerWeek, schedule } = req.body;

  try {
    const updateGoal = {};
    if (daysPerWeek !== undefined) updateGoal.daysPerWeek = daysPerWeek;
    if (schedule !== undefined) updateGoal.schedule = schedule;

    const updated = await WorkoutGoal.findByIdAndUpdate(id, updateGoal, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Workout goal not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating workout goal" });
  }
};

export const updateWorkoutGoalByDay = async (req, res) => {
  const { id } = req.params;
  const { day, muscleGroups } = req.body;

  try {
    if (!day) {
      return res.status(400).json({ message: "day is required" });
    }

    // Build the dynamic path: schedule.<day>.muscleGroups
    const dayKey = String(day).toLowerCase();
    const path = `schedule.${dayKey}.muscleGroups`;

    const updated = await WorkoutGoal.findByIdAndUpdate(
      id,
      { $set: { [path]: muscleGroups ?? [] } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Workout goal not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating workout goal" });
  }
};

export const deleteWorkoutGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await WorkoutGoal.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Workout goal not found" });
    }
    res.status(200).json({ message: "Workout goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workout goal" });
  }
};

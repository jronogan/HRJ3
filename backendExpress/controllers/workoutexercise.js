import WorkoutExercise from "../models/WorkoutExercises.js";

export const getWorkoutExercises = async (req, res) => {
  try {
    const exercises = await WorkoutExercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout exercises" });
  }
};

export const getWorkoutExerciseById = async (req, res) => {
  const { id } = req.params;

  try {
    const exercise = await WorkoutExercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: "Workout exercise not found" });
    }
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout exercise" });
  }
};

export const getWorkoutExerciseByPart = async (req, res) => {
  const { part } = req.params;

  try {
    const exercises = await WorkoutExercise.find({ exerciseBodyParts: part });
    if (!exercises || exercises.length === 0) {
      return res
        .status(404)
        .json({ message: "No workout exercises found for this body part" });
    }
    res.status(200).json(exercises);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching workout exercises by body part" });
  }
};

export const createWorkoutExercise = async (req, res) => {
  const {
    exerciseName,
    exerciseGif,
    exerciseBodyParts,
    instructions,
    equipment,
  } = req.body;

  try {
    const newExercise = new WorkoutExercise({
      exerciseName,
      exerciseGif,
      exerciseBodyParts,
      instructions,
      equipment,
    });

    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ message: "Error creating workout exercise" });
  }
};

export const updateWorkoutExercise = async (req, res) => {
  const { id } = req.params;
  const {
    exerciseName,
    exerciseGif,
    exerciseBodyParts,
    instructions,
    equipment,
  } = req.body;

  try {
    const update = {};
    if (exerciseName !== undefined) update.exerciseName = exerciseName;
    if (exerciseGif !== undefined) update.exerciseGif = exerciseGif;
    if (exerciseBodyParts !== undefined)
      update.exerciseBodyParts = exerciseBodyParts;
    if (instructions !== undefined) update.instructions = instructions;
    if (equipment !== undefined) update.equipment = equipment;

    const updatedExercise = await WorkoutExercise.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedExercise) {
      return res.status(404).json({ message: "Workout exercise not found" });
    }

    res.status(200).json(updatedExercise);
  } catch (error) {
    res.status(500).json({ message: "Error updating workout exercise" });
  }
};

export const deleteWorkoutExercise = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExercise = await WorkoutExercise.findByIdAndDelete(id);
    if (!deletedExercise) {
      return res.status(404).json({ message: "Workout exercise not found" });
    }
    res.status(200).json({ message: "Workout exercise deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workout exercise" });
  }
};

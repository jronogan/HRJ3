import User from "../models/User.js";
import WorkoutGoal from "../models/WorkoutGoal.js";
import NutritionGoal from "../models/NutritionGoal.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// register user

export const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    goal,
    height,
    weight,
    gender,
    age,
    workoutGoal,
    nutritionGoal,
  } = req.body;

  const findExistingUser = await User.findOne({ email });

  if (findExistingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      goal,
      height,
      weight,
      gender,
      age,
    });
    await newUser.save();

    // Create associated goals if provided (recommended for your new registration flow)
    let createdWorkoutGoal = null;
    let createdNutritionGoal = null;

    try {
      if (workoutGoal) {
        const { daysPerWeek, schedule } = workoutGoal;
        createdWorkoutGoal = await WorkoutGoal.create({
          userId: newUser._id,
          daysPerWeek,
          schedule,
        });
      }

      if (nutritionGoal) {
        const {
          caloriesPerDay,
          proteinGramsPerDay,
          carbsGramsPerDay,
          fatsGramsPerDay,
        } = nutritionGoal;

        createdNutritionGoal = await NutritionGoal.create({
          userId: newUser._id,
          caloriesPerDay,
          proteinGramsPerDay,
          carbsGramsPerDay,
          fatsGramsPerDay,
        });
      }
    } catch (goalError) {
      // If goals fail, clean up the user so registration stays all-or-nothing
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        message: "Error creating user goals",
        error: goalError.message,
      });
    }

    res.status(201).json({
      user: newUser,
      workoutGoal: createdWorkoutGoal,
      nutritionGoal: createdNutritionGoal,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

// login user

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const access = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY, {
      expiresIn: "15m",
    });

    const refresh = jwt.sign({ id: user._id }, process.env.SECRET_REFRESH_KEY, {
      expiresIn: "30d",
    });
    res.status(200).json({ access, refresh });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error logging in" });
  }
};

// refresh user

export const refreshUser = async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.body.refresh,
      process.env.SECRET_REFRESH_KEY
    );

    const access = jwt.sign(
      {
        id: decoded.id,
      },
      process.env.SECRET_ACCESS_KEY,
      {
        expiresIn: "15m",
        jwtid: uuidv4(),
      }
    );
    res.json({ access });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error refreshing token" });
  }
};

// get current user (requires Authorization: Bearer <accessToken>)
export const getMe = async (req, res) => {
  try {
    const userId = req.decoded?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [workoutGoal, nutritionGoal] = await Promise.all([
      WorkoutGoal.findOne({ userId }),
      NutritionGoal.findOne({ userId }),
    ]);

    res.status(200).json({ user, workoutGoal, nutritionGoal });
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user" });
  }
};

// Update Current User
export const updateMe = async (req, res) => {
  try {
    const userId = req.decoded?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    const { name, email, password, goal, height, weight, gender, age } =
      req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 12);
    if (goal) user.goal = goal;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (gender) user.gender = gender;
    if (age) user.age = age;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

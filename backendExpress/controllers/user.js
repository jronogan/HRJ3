import User from "../models/User.js";
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
  const { name, email, password, goal, height, weight, gender, age } = req.body;

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
    res.status(201).json(newUser);
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
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET_REFRESH_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.SECRET_ACCESS_KEY,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json(newAccessToken);
  });
};

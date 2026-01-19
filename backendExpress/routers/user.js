import express from "express";
import {
  createUser,
  getMe,
  getUsers,
  loginUser,
  refreshUser,
  updateMe,
} from "../controllers/user.js";
import { isSignedIn } from "../middleware/is-signed-in.js";
import { validate } from "../validators/validate.js";
import { validateUserLogin, validateUserRegister } from "../validators/user.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", isSignedIn, getMe);
router.patch("/me", isSignedIn, updateMe);
router.post("/register", validateUserRegister, validate, createUser);
router.post("/login", validateUserLogin, validate, loginUser);
router.post("/refresh", refreshUser);

export default router;

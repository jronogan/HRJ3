import express from "express";
import {
  createUser,
  getMe,
  getUsers,
  loginUser,
  refreshUser,
} from "../controllers/user.js";
import { isSignedIn } from "../middleware/is-signed-in.js";
import { validate } from "../validators/validate.js";
import {
  validateUserLogin,
  validateUserRegister,
  validateUserRefresh,
} from "../validators/user.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", isSignedIn, getMe);
router.post("/register", validateUserRegister, validate, createUser);
router.post("/login", validateUserLogin, validate, loginUser);
router.post("/refresh", validateUserRefresh, validate, refreshUser);

export default router;

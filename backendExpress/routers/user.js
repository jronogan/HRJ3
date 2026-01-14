import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  refreshUser,
} from "../controllers/user.js";
import { validate } from "../validators/validate.js";
import {
  validateUserLogin,
  validateUserRegister,
  validateUserRefresh,
} from "../validators/user.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/register", validateUserRegister, validate, createUser);
router.post("/login", validateUserLogin, validate, loginUser);
router.post("/refresh", validateUserRefresh, validate, refreshUser);

export default router;

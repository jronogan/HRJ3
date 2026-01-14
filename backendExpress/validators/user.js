import { body } from "express-validator";

const goalValues = ["weight_loss", "weight_gain", "maintenance"];
const genderValues = ["male", "female", "other"];

export const validateUserRegister = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email is required"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("goal")
    .isIn(goalValues)
    .withMessage(`goal must be one of: ${goalValues.join(", ")}`),
  body("height")
    .isNumeric()
    .withMessage("height must be a number")
    .custom((v) => Number(v) > 0)
    .withMessage("height must be > 0"),
  body("weight")
    .isNumeric()
    .withMessage("weight must be a number")
    .custom((v) => Number(v) > 0)
    .withMessage("weight must be > 0"),
  body("gender")
    .isIn(genderValues)
    .withMessage(`gender must be one of: ${genderValues.join(", ")}`),
  body("age").isInt({ min: 1 }).withMessage("age must be a positive integer"),
];

export const validateUserLogin = [
  body("email").isEmail().withMessage("valid email is required"),
  body("password").notEmpty().withMessage("password is required"),
];

export const validateUserRefresh = [];

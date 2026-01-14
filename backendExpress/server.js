import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";
import connectDB from "./db/db.js";
import workoutLogRouter from "./routers/workoutlog.js";
import nutritionLogRouter from "./routers/nutritionlog.js";
import workoutGoalRouter from "./routers/workoutgoal.js";
import nutritionGoalRouter from "./routers/nutritiongoal.js";
import userRouter from "./routers/user.js";

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/workoutlogs", workoutLogRouter);
app.use("/nutritionlogs", nutritionLogRouter);
app.use("/workoutgoals", workoutGoalRouter);
app.use("/nutritiongoals", nutritionGoalRouter);
app.use("/users", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// error catching
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("JSON parsing error:", err.message);

    return res.status(400).json({
      status: 400,
      msg: "invalid JSON format",
    });
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.type === "entity.parse.failed"
  ) {
    console.error("URL-encoded parsing error:", err.message);

    return res.status(400).json({
      status: 400,
      msg: "invalid form data format",
    });
  }

  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: "error",
    msg: "an unknown error occurred",
  });
});

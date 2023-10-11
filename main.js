const express = require("express");
const dotenv = require("dotenv");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
app.use(express.json());

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

dotenv.config({ path: "./config.env" });

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("", (req, res, next) => {
  // console.log(req.body, "body in the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Cant find ${req.originalUrl}`,
  });
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful"));

// sasa;

const port = process.env.PORT || 8082;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

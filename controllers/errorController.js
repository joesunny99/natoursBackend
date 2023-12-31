const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  console.log("inside cast error");
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //   console.log(err);
  //   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  //   console.log(value);

  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  console.log("is it here");
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  // console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  //   console.log(err.name);

  if (process.env.NODE_ENV === "development") {
    // console.log("checking here again");
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    console.log("checking here too");

    let error = { ...err };

    // console.log("checking also here", err.name, error.name, err, error);

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

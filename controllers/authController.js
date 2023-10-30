const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // let name = "Joe";
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;

  //1- get the user based on email
  let loginUser = await User.findOne({ email: email }).select("+password");
  console.log(loginUser);

  if (!loginUser) {
    return next(new AppError("The username does not exist", 404));
  }

  let passwordMatch = await loginUser.correctPassword(
    password,
    loginUser.password
  );

  // console.log(passwordMatch);

  if (!passwordMatch) {
    return next(new AppError("The password does not match", 404));
  }

  const token = getToken(loginUser._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1-check if token is there

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Token Missing. Please relog"), 404);
  }

  //2-decode the token

  token = req.headers.authorization.split(" ")[1];
  if (!token) return next(new AppError("Token missing. Please relog", 404));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded, "check");

  const checkUser = await User.findOne({ _id: decoded.id });
  console.log(checkUser);
  if (!checkUser) {
    return next(new AppError("The logged in user does not exist anymore", 400));
  }

  req.user = checkUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission", 403));
    }
    next();
  };
};

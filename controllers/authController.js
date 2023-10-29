const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

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

  //2-check if password matches with password
});

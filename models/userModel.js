const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide us your mail"],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: "Passwords are not matching",
    },
  },
});

userSchema.pre("save", async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(reqPassword, userPassword) {
  // reqPassword
  console.log(reqPassword, userPassword);
  return await bcrypt.compare(reqPassword, userPassword);
};



const User = mongoose.model("User", userSchema);

module.exports = User;
const UserModel = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.signupGET = (req, res, next) => {
  res.render("signup");
};

exports.signupPOST = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  // TODO: check username doesn't already exist
  // TODO: try catch
  // TODO: Re-render sign up page upon validation issues

  bcrypt.hash(password, 16, async (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    const user = new UserModel({
      username,
      password: hashedPassword,
    });
    await user.save();
  });

  res.redirect("/");
};

exports.loginGET = (req, res, next) => {
  res.render("login");
};

exports.logoutGET = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

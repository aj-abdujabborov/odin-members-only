// Auth modules
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local");
// Controller help
const asyncHandler = require("express-async-handler");
const { body, validationResult, matchedData } = require("express-validator");
// My modules
const UserModel = require("../models/user");

// --- AUTHENTICATION ---
// Authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const authFailed = {
      message: "Wrong email or password",
    };

    try {
      const user = await UserModel.findOne({ username }).exec();
      if (!user || !user._id) return done(null, false, authFailed);

      const match = await bcrypt.compare(password, user.password);
      if (match !== true) return done(null, false, authFailed);

      return done(null, user);
    } catch (err) {
      done(err);
    }
  })
);

// Help passport associate user's session ID with their user ID
passport.serializeUser((user, done) => done(null, user.id));

// When user makes a requst with session ID, find the associated user ID and acquire user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// --- VALIDATIONS ---
const signupValidationArray = [
  body(
    "username",
    "Username must be at least 4 characters. It can include alphanumeric characters as well dots, dashes and underscores"
  ).matches(/^[a-zA-Z0-9._-]{4,}$/),
  body("username", "Username already exists").custom(async (value) => {
    const user = await UserModel.findOne({ username: value }).exec();
    if (user) throw new Error("Username already exists");
  }),
  body("password", "Password must be at least 4 characters long").isLength({
    min: 4,
  }),
];

// -- CONTROLLERS --
exports.signupGET = (req, res, next) => {
  res.render("signup");
};

exports.signupPOST = [
  ...signupValidationArray,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const data = matchedData(req);

    const user = { username: data.username };

    if (!errors.isEmpty()) {
      return res.render("signup", { user, errors: errors.array() });
    }

    const hashedPassword = await bcrypt.hash(data.password, 16);
    user.password = hashedPassword;
    const doc = new UserModel(user);
    await doc.save();

    // Auto-log in
    req.login(doc, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  }),
];

exports.loginGET = (req, res, next) => {
  res.render("login");
};

exports.loginPOST = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureMessage: true,
});

exports.logoutGET = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

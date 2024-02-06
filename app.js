// Modules
const path = require("node:path");
const express = require("express");
const httpCreateError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const compression = require("compression"); // compress responses so that user downloads them faster
const helmet = require("helmet"); // protection against security vulnerabilities
const RateLimit = require("express-rate-limit"); // protection against repeated requests
// Models
const UserModel = require("./models/user");

// Connect to MongoDB
async function mongoConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error(err);
  }
}
mongoConnect();

// App
const app = express();

// Security & compression
const securityAndCompression = [
  RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 40,
  }), // need to design page for when limit is exceeded
  helmet.contentSecurityPolicy(),
  compression(),
];
app.use(securityAndCompression);

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Development logger
app.use(morgan("dev"));

// Retrieve objects made with POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Supply static files
app.use(express.static("./public"));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.session()); // use session to maintain login status across requests

// Authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const authFailed = { message: "Username or password incorrect" };
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

// Make user data easily available if there is an established session
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("layout");
});

app.get("/signup", (req, res, next) => {
  res.render("signup");
});
// TODO: validate sign up details
app.post("/signup", (req, res, next) => {
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
});

app.get("/login", (req, res, next) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    // TODO: Respond with helpful message when authentication fails
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Error-handling
app.use(function (req, res, next) {
  next(httpCreateError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // how does locals get used?

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Export
module.exports = app;

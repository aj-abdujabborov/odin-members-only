// Modules
const path = require("node:path");
const express = require("express");
const httpCreateError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const compression = require("compression"); // compress responses so that user downloads them faster
const helmet = require("helmet"); // protection against security vulnerabilities
const RateLimit = require("express-rate-limit"); // protection against repeated requests
// Models
const UserModel = require("./models/user");
// Routers
const AuthRouter = require("./routes/auth");

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

// Make user data easily available if there is an established session
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.sessionMessages = req.session.messages || []; // saved messages if login fails
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/", AuthRouter);

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

// Modules
const path = require("node:path");
const express = require("express");
const httpCreateError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression"); // compress responses so that user downloads them faster
const helmet = require("helmet"); // protection against security vulnerabilities
const RateLimit = require("express-rate-limit"); // protection against repeated requests

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
const middlewareChain = [
  RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 40,
  }), // need to design page for when limit is exceeded
  helmet.contentSecurityPolicy(),
  compression(),
];

app.use(middlewareChain);

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

// Routes
app.get("/", (req, res) => {
  res.render("layout");
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

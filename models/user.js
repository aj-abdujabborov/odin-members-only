const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true, minLength: 1 },
  lastName: { type: String, required: true, minLength: 1 },
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._-]{4,}$/,
  },
  password: {
    type: String,
    required: true,
  },
  membership: {
    type: String,
    required: true,
    enum: ["admin", "member", "outsider"],
  },
});

UserSchema.methods.isAdmin = function () {
  return this.membership === "admin";
};

UserSchema.methods.isMember = function () {
  return this.membership === "member";
};

UserSchema.methods.isOutsider = function () {
  return this.membership === "outsider";
};

UserSchema.methods.setToAdmin = function () {
  this.membership = "admin";
};

UserSchema.methods.setToMember = function () {
  this.membership = "member";
};

UserSchema.methods.setToOutsider = function () {
  this.membership = "outsider";
};

module.exports = mongoose.model("User", UserSchema);

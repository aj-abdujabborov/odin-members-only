const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//   firstName: { type: String, required: true, minLength: 1 },
//   lastName: { type: String, required: true, minLength: 1 },
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /^[a-zA-Z0-9._-]{4,}$/,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   membership: { type: String, required: true, enum: ["admin", "member"] },
// });

const UserSchema = new Schema({
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
});

module.exports = mongoose.model("User", UserSchema);

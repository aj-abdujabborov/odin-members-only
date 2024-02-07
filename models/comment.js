const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  title: { type: String, required: true, minLength: 1 },
  comment: { type: String, required: true, minLength: 1 },
  author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  time: { type: Schema.Types.Date, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);

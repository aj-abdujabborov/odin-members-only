const asyncHandler = require("express-async-handler");
const { body, validationResult, matchedData } = require("express-validator");
const CommentModel = require("../models/comment");

exports.commentsGET = asyncHandler(async (req, res, next) => {
  res.render("comments");
});

exports.newCommentGET = (req, res, next) => {
  res.render("newComment");
};

exports.newCommentPOST = [
  body("title", "Title is required").isLength({ min: 1 }).trim().escape(),
  body("comment", "Comment is required").isLength({ min: 1 }).trim().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const data = matchedData(req);

    const comment = { title: data.title, comment: data.comment };

    if (!errors.isEmpty()) {
      return res.render("newComment", { errors: errors.array(), comment });
    }

    comment.time = new Date();
    comment.author = req.user._id;

    const doc = new CommentModel(comment);
    await doc.save();

    res.redirect("/");
  }),
];

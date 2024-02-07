const asyncHandler = require("express-async-handler");
const { body, validationResult, matchedData } = require("express-validator");
const { format, formatRelative } = require("date-fns");
const CommentModel = require("../models/comment");

exports.commentsGET = asyncHandler(async (req, res, next) => {
  let query = CommentModel.find().sort({ time: -1 });
  if (req.user && !req.user.isOutsider()) {
    query.populate("author", "username firstName lastName");
  } else {
    query.projection("-author");
  }
  const comments = await query.exec();

  const formattedComments = comments.map((comm) => {
    return {
      _id: comm._id,
      title: comm.title,
      comment: comm.comment,
      time: formatRelative(comm.time, new Date()),
      author: comm.author,
    };
  });

  res.render("comments", { comments: formattedComments });
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

exports.deletePOST = [
  body("commentId").escape(),
  asyncHandler(async (req, res, next) => {
    const data = matchedData(req);
    await CommentModel.findByIdAndDelete(data.commentId).exec();
    res.redirect("/");
  }),
];

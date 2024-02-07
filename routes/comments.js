const router = require("express").Router();
const CommentsController = require("../controllers/comments");

router.get("/", CommentsController.commentsGET);

// Need to be logged in for all the following routes
router.use((req, res, next) => {
  if (!req.user) return next(new Error("User not logged in"));
  next();
});

router.get("/new", CommentsController.newCommentGET);
router.post("/new", CommentsController.newCommentPOST);

router.use((req, res, next) => {
  if (!req.user.isAdmin())
    return next(new Error("You do not have administrator privileges"));
  next();
});
router.post("/delete", CommentsController.deletePOST);

module.exports = router;

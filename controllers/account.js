const asyncHandler = require("express-async-handler");
const { body, validationResult, matchedData } = require("express-validator");
const UserModel = require("../models/user");

exports.accountGET = asyncHandler((req, res, next) => {
  if (!res.locals.currentUser) throw new Error("Not logged into account");

  res.render("account");
});

exports.accountPOST = [
  body("memberKey", "Membership key is incorrect")
    .optional()
    .custom((value) => value === process.env.MEMBER_KEY),
  body("adminKey", "Admin key is incorrect")
    .optional()
    .custom((value) => value === process.env.ADMIN_KEY),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const data = matchedData(req);

    if (!errors.isEmpty()) {
      return res.render("account", { errors: errors.array() });
    }

    const user = await UserModel.findById(req.user.id).exec();
    if (data.memberKey) {
      user.setToMember();
    } else {
      user.setToAdmin();
    }
    await user.save();
    res.render("account", {
      passMessage:
        "Your account is updated! Refresh in a few seconds to see the changes reflected",
    });
  }),
];

const router = require("express").Router();
const AccountController = require("../controllers/account");

router.get("/", AccountController.accountGET);
router.post("/", AccountController.accountPOST);

module.exports = router;

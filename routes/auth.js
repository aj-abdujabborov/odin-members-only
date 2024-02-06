const Auth = require("../controllers/auth");
const router = require("express").Router();

router.get("/signup", Auth.signupGET);
router.post("/signup", Auth.signupPOST);
router.get("/login", Auth.loginGET);
router.post("/login", Auth.loginPOST);
router.get("/logout", Auth.logoutGET);

module.exports = router;

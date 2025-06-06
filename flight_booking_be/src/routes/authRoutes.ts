import * as express from "express";

const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/refresh", authController.refreshToken);

router.post("/verify-user", authController.verifyUser);

router.get("/check-refresh-token", authController.checkTokenExpiration);

router.post("/request-password-reset", authController.requestPasswordReset);

router.post("/password/edit", authController.verifyResetPasswordRequest);

router.post("/reset-password", authController.resetPassword);


router.patch("/password/reset", authController.changePassword);

module.exports = router;

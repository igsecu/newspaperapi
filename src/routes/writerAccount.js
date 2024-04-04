const express = require("express");
const router = express.Router();

const writerAccountController = require("../controllers/writerAccount");
const logoutController = require("../controllers/logout");
const authController = require("../controllers/auth");

const fileUpload = require("express-fileupload");

// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", writerAccountController.getLoggedInAccount);
// Create Article
router.post(
  "/article",
  authController.ensureAuthenticatedWriter,
  writerAccountController.createArticle
);
// Login process
router.post("/login", writerAccountController.login);
// Update profile image
router.put(
  "/account/image",
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  authController.ensureAuthenticatedWriter,
  writerAccountController.updateProfileImage
);
// Delete profile image
router.delete(
  "/account/image",
  authController.ensureAuthenticatedWriter,
  writerAccountController.deleteProfileImage
);

module.exports = router;

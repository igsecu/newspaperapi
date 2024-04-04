const express = require("express");
const router = express.Router();

const adminAccountController = require("../controllers/adminAccount");
const logoutController = require("../controllers/logout");
const authController = require("../controllers/auth");

// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", adminAccountController.getLoggedInAccount);
// Create section
router.post(
  "/section",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.createSection
);
// Create writer
router.post(
  "/writer/account",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.createWriter
);
// Login process
router.post("/login", adminAccountController.login);
// Create admin account
router.post("/account", adminAccountController.createAccount);
// Update article
router.put(
  "/article/:id",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.updateArticle
);

module.exports = router;

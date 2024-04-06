const express = require("express");
const router = express.Router();

const adminAccountController = require("../controllers/adminAccount");
const logoutController = require("../controllers/logout");
const authController = require("../controllers/auth");

// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", adminAccountController.getLoggedInAccount);
// Create Paypal Plan
router.post(
  "/create-plan",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.createPaypalPlan
);
// Create Paypal Product
router.post(
  "/create-product",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.createPaypalProduct
);
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
// Update account
router.put(
  "/user/:id",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.updateUserAccount
);
// Update writer account
router.put(
  "/writer/:id",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.updateWriterAccount
);

module.exports = router;

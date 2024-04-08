const express = require("express");
const router = express.Router();

const adminAccountController = require("../controllers/adminAccount");
const logoutController = require("../controllers/logout");
const authController = require("../controllers/auth");

// Get users filtered
router.get(
  "/users/filter",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getFilteredUsers
);
// Get all users
router.get(
  "/users",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getUsers
);
// Get articles for subscribers
router.get(
  "/articles/subscribers/true",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getArticlesForSubscribers
);
// Get shown articles
router.get(
  "/articles/shown/true",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getShownArticles
);
// Get all articles
router.get(
  "/articles",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getArticles
);
// Get not banned writers
router.get(
  "/writers/banned/false",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getNotBannedWriters
);
// Get banned writers
router.get(
  "/writers/banned/true",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getBannedWriters
);
// Get all writers
router.get(
  "/writers",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getWriters
);
// Get all sections
router.get(
  "/sections",
  authController.ensureAuthenticatedAdmin,
  adminAccountController.getSections
);
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

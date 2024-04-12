const express = require("express");
const router = express.Router();

const usersAccountsController = require("../controllers/usersAccount");
const authController = require("../controllers/auth");
const logoutController = require("../controllers/logout");

// Get notifications
router.get(
  "/notifications",
  authController.ensureAuthenticatedUser,
  usersAccountsController.getNotifications
);
// Get article comments
router.get(
  "/comments/article/:id",
  authController.ensureAuthenticatedUser,
  usersAccountsController.getArticleComments
);
// Get article by id
router.get(
  "/article/:id",
  authController.ensureAuthenticatedUser,
  usersAccountsController.getArticleById
);
// Payment cancelled
router.get("/payment/cancel", usersAccountsController.paymentCancel);
// Payment success
router.get("/payment/success", usersAccountsController.paymentSuccess);
// Verify account
router.get("/account/:id/verify", usersAccountsController.verifyAccount);
// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", usersAccountsController.getLoggedInAccount);
// Create comment
router.post(
  "/comment",
  authController.ensureAuthenticatedUser,
  usersAccountsController.createComment
);
// Cancel subscription
router.post(
  "/cancel-subscription",
  authController.ensureAuthenticatedUser,
  usersAccountsController.cancelSubscription
);
// Create subscription
router.post(
  "/create-subscription",
  authController.ensureAuthenticatedUser,
  usersAccountsController.createSubscription
);
// Login process
router.post("/login", usersAccountsController.login);
// Create account
router.post("/account", usersAccountsController.createAccount);
// Delete account
router.delete(
  "/account",
  authController.ensureAuthenticatedUser,
  usersAccountsController.deleteAccount
);

module.exports = router;

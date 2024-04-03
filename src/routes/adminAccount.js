const express = require("express");
const router = express.Router();

const adminAccountController = require("../controllers/adminAccount");
const logoutController = require("../controllers/logout");

// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", adminAccountController.getLoggedInAccount);
// Login process
router.post("/login", adminAccountController.login);
// Create admin account
router.post("/account", adminAccountController.createAccount);

module.exports = router;

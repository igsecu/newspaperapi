const express = require("express");
const router = express.Router();

const writerAccountController = require("../controllers/writerAccount");
const logoutController = require("../controllers/logout");
const authController = require("../controllers/auth");

// Logout process
router.get("/logout", logoutController.logout);
// Get logged in account
router.get("/account", writerAccountController.getLoggedInAccount);
// Login process
router.post("/login", writerAccountController.login);

module.exports = router;

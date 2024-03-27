const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersAccountsController = require("../controllers/usersAccount");

// Create account
router.post("/account", usersAccountsController.createAccount);

module.exports = router;

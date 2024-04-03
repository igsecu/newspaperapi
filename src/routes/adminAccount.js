const express = require("express");
const router = express.Router();

const adminAccountController = require("../controllers/adminAccount");

// Create admin account
router.post("/account", adminAccountController.createAccount);

module.exports = router;

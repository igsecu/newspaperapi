const express = require("express");
const router = express.Router();

const usersAccountRouter = require("./usersAccount");

// Specify routers root routes
router.use("/users", usersAccountRouter);

module.exports = router;

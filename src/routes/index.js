const express = require("express");
const router = express.Router();

const usersAccountRouter = require("./usersAccount");
const adminAccountRouter = require("./adminAccount");

// Specify routers root routes
router.use("/users", usersAccountRouter);

router.use("/admin", adminAccountRouter);

module.exports = router;

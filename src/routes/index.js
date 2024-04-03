const express = require("express");
const router = express.Router();

const usersAccountRouter = require("./usersAccount");
const adminAccountRouter = require("./adminAccount");
const writerAccountRouter = require("./writerAccount");

// Specify routers root routes
router.use("/users", usersAccountRouter);

router.use("/admin", adminAccountRouter);

router.use("/writers", writerAccountRouter);

module.exports = router;

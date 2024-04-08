const express = require("express");
const router = express.Router();

const usersAccountRouter = require("./usersAccount");
const adminAccountRouter = require("./adminAccount");
const writerAccountRouter = require("./writerAccount");
const homeRouter = require("./home");

// Specify routers root routes
router.use("/users", usersAccountRouter);

router.use("/admin", adminAccountRouter);

router.use("/writers", writerAccountRouter);

router.use("/", homeRouter);

module.exports = router;

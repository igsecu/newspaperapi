const session = require("express-session");
require("dotenv").config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  credentials: true,
  name: "sid",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production" ? "true" : "auto",
    httpOnly: true,
    expires: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

module.exports = {
  sessionMiddleware,
};

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const db = require("./src/database/db");
const router = require("./src/routes/index");
const passport = require("passport");
const { sessionMiddleware } = require("./src/controllers/session");

// Database Models
const UsersAccount = require("./src/models/UsersAccount");
const Notification = require("./src/models/Notification");
const Section = require("./src/models/Section");
const WriterAccount = require("./src/models/WriterAccount");
const Article = require("./src/models/Article");

UsersAccount.hasMany(Notification);
Notification.belongsTo(UsersAccount);

Section.hasMany(WriterAccount);
WriterAccount.belongsTo(Section);

WriterAccount.hasMany(Article);
Article.belongsTo(WriterAccount);

Section.hasMany(Article);
Article.belongsTo(Section);

// Body-Parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(sessionMiddleware);

// Passport Config
require("./src/passport/config")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Res Headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// Router middleware
app.use("/api", router);

// Error catching endware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  res.status(status).json({
    statusCode: status,
    msg: message,
  });
});

// Initialized Express Server
db.sync({}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
  });
});

module.exports = app;

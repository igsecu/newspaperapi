const bcrypt = require("bcryptjs");
const passport = require("passport");

const {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateId,
} = require("../utils/index");

const adminAccountServices = require("../services/adminAccount");

// Create admin account
const createAccount = async (req, res, next) => {
  const { email, password, password2 } = req.body;
  try {
    // Validations
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await adminAccountServices.checkEmailExist(email);

    if (emailExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Email "${email}" exists! Try with another one!`,
      });
    }

    if (validatePassword(password)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePassword(password),
      });
    }

    if (validatePasswordConfirmation(password, password2)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePasswordConfirmation(password, password2),
      });
    }

    // Hash Password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return next("Error trying to create a new account");
        }
        try {
          const accountCreated = await adminAccountServices.createAccount(
            hash,
            email
          );

          if (accountCreated) {
            const account = await adminAccountServices.getAccountById(
              accountCreated.id
            );

            return res.status(201).json({
              statusCode: 201,
              data: account,
              msg: "Account created successfully!",
            });
          }
        } catch (error) {
          console.log(error.message);
          return next("Error trying to create a new account");
        }
      });
    });
  } catch (error) {
    console.log(error);
    return next("Error trying to create a new account");
  }
};

// Login process
const login = async (req, res, next) => {
  if (req.user) {
    return res.status(400).json({
      statusCode: 400,
      msg: "An user is already logged in!",
    });
  }

  const { email, password } = req.body;

  if (validateEmail(email)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateEmail(email),
    });
  }

  if (!password) {
    return res.status(400).json({
      statusCode: 400,
      msg: "Password is missing",
    });
  }

  passport.authenticate("admin", (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      if (info.statusCode === 400) {
        return res.status(400).json({
          statusCode: info.statusCode,
          msg: info.msg,
        });
      }
      return res.status(404).json({
        statusCode: info.statusCode,
        msg: info.msg,
      });
    }
    req.logIn(user, (error) => {
      if (error) {
        console.log(error.message);
        return next(error);
      }
      return res.status(200).json({
        statusCode: 200,
        msg: "You logged in successfully",
      });
    });
  })(req, res, next);
};

// Get logged in account
const getLoggedInAccount = async (req, res, next) => {
  if (req.user && req.user.type === "ADMIN") {
    const account = await adminAccountServices.getAccountById(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      data: account,
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      msg: `No Admin Account logged in`,
    });
  }
};

module.exports = {
  createAccount,
  login,
  getLoggedInAccount,
};

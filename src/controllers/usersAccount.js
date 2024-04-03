const bcrypt = require("bcryptjs");
const passport = require("passport");

const {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateId,
} = require("../utils/index");

const usersAccountsServices = require("../services/usersAccount");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");

// Get logged in account
const getLoggedInAccount = async (req, res, next) => {
  if (req.user && req.user.type === "USER") {
    const account = await usersAccountsServices.getAccountById(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      data: account,
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      msg: `No User Account logged in`,
    });
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

  passport.authenticate("local", (error, user, info) => {
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

// Create new account
const createAccount = async (req, res, next) => {
  const { email, password, password2 } = req.body;

  try {
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await usersAccountsServices.checkEmailExist(
      email.toLowerCase()
    );

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
          const accountCreated = await usersAccountsServices.createAccount(
            hash,
            email
          );

          if (accountCreated) {
            const account = await usersAccountsServices.getAccountById(
              accountCreated.id
            );

            const url = `${process.env.URL}/api/users/account/${account.id}/verify`;

            //await emailsServices.sendEmailVerification(url, account.email);

            await notificationsServices.createNotification(
              account.id,
              "Your account was created successfully!"
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
    return next(error);
  }
};

// Delete account
const deleteAccount = async (req, res, next) => {
  try {
    const accountDeleted = await usersAccountsServices.deleteAccount(
      req.user.id
    );

    if (accountDeleted) {
      req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((err) => {
          return res.status(200).json({
            statusCode: 200,
            msg: "Account deleted successfully!",
          });
        });
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Verify account
const verifyAccount = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const accountFound = await usersAccountsServices.getAccountById(id);

    if (!accountFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    if (accountFound.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! You can not verify it...",
      });
    }

    if (accountFound.isVerified === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is already verified!",
      });
    }

    const updatedAccount = await usersAccountsServices.updateIsVerifiedAccount(
      id
    );

    if (updatedAccount) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Your account is now verified!",
        data: updatedAccount,
      });
    }
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

module.exports = {
  createAccount,
  login,
  getLoggedInAccount,
  deleteAccount,
  verifyAccount,
};

const bcrypt = require("bcryptjs");
const passport = require("passport");
const request = require("request");

const {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateId,
} = require("../utils/index");

const usersAccountsServices = require("../services/usersAccount");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");

require("dotenv").config();

const paypal = require("paypal-rest-sdk");
const { router } = require("../..");
// Configure Paypal
paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

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
            await usersAccountsServices.createSubscriber(accountCreated.id);

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

// Create subscription
const createSubscription = async (req, res, next) => {
  const { planId } = req.body;

  const subscription = {
    plan_id: planId,
    start_time: oneMonthFromNow(),
    quantity: 1,
    subscriber: {
      email: req.user.email,
    },
    application_context: {
      brand_name: "Newspaper",
      locale: "en-US",
      shipping_preference: "SET_PROVIDED_ADDRESS",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected: "PAYPAL",
        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: `${process.env.URL}/api/users/payment/success`,
      cancel_url: `${process.env.URL}/api/users/payment/cancel`,
    },
  };

  request.post(
    `${process.env.PAYPAL_API}/v1/billing/subscriptions`,
    {
      auth: {
        user: process.env.PAYPAL_CLIENT_ID,
        pass: process.env.PAYPAL_CLIENT_SECRET,
      },
      body: subscription,
      json: true,
    },
    (err, response) => {
      if (err) {
        return next("Error trying to create a new subscription");
      }

      for (link of response.body.links) {
        if (link.rel === "approve") {
          res.status(200).json({
            statusCode: 200,
            data: link.href,
          });
        }
      }
    }
  );
};

// Payment Success
const paymentSuccess = (req, res, next) => {
  const { subscription_id } = req.query;
  console.log(subscription_id);
  res.status(200).json({
    statusCode: 200,
    msg: "You have subscribed successfully!",
  });
};

// Payment Cancel
const paymentCancel = (req, res, next) => {
  res.status(400).json({
    statusCode: 400,
    msg: "Your payment have been cancelled!",
  });
};

// Cancel subscription
const cancelSubscription = async (req, res, next) => {
  const { subscription_id } = req.body;

  request.post(
    `${process.env.PAYPAL_API}/v1/billing/subscriptions/${subscription_id}/cancel`,
    {
      auth: {
        user: process.env.PAYPAL_CLIENT_ID,
        pass: process.env.PAYPAL_CLIENT_SECRET,
      },
      body: {
        reason: "Not satisfied with the service",
      },
      json: true,
    },
    (err, response) => {
      if (err) {
        return next("Error trying to cancel subscription");
      }

      res.status(200).json({
        statusCode: 200,
        msg: "Subscription Cancelled!",
        data: response,
      });
    }
  );
};

const oneMonthFromNow = () => {
  // Get the current date
  const currentDate = new Date();

  // Get the month of the current date
  let nextMonth = currentDate.getMonth() + 1;

  // Get the year of the current date
  let year = currentDate.getFullYear();

  // If the next month exceeds December, increment the year and reset the month to January
  if (nextMonth > 11) {
    nextMonth = 0; // January
    year++;
  }

  // Create a new Date object for one month from now
  const oneMonthFromNow = new Date(year, nextMonth, currentDate.getDate());

  return oneMonthFromNow;
};

module.exports = {
  createAccount,
  login,
  getLoggedInAccount,
  deleteAccount,
  verifyAccount,
  createSubscription,
  paymentSuccess,
  paymentCancel,
  cancelSubscription,
};

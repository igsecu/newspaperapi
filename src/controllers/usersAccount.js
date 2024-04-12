const bcrypt = require("bcryptjs");
const passport = require("passport");
const request = require("request");

const {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateId,
  oneMonthFromNow,
  validateText,
} = require("../utils/index");

const usersAccountsServices = require("../services/usersAccount");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");
const writerAccountServices = require("../services/writerAccount");
const Article = require("../models/Article");

require("dotenv").config();

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
  const subscription = {
    plan_id: process.env.PAYPAL_PLAN_ID,
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
const paymentSuccess = async (req, res, next) => {
  const { subscription_id } = req.query;

  try {
    const subscriberUpdated = await usersAccountsServices.updateSubscriber(
      req.user.subscriber.id,
      subscription_id,
      req.user.id
    );

    //await emailsServices.sendEmailSubscription(req.user.email);

    res.status(200).json({
      statusCode: 200,
      msg: "You have subscribed successfully!",
      data: subscriberUpdated,
    });
  } catch (error) {
    return next(error);
  }
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
  request.post(
    `${process.env.PAYPAL_API}/v1/billing/subscriptions/${req.user.subscriber.subscriptionId}/cancel`,
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
    async (err, response) => {
      if (err) {
        return next("Error trying to cancel subscription");
      }

      const subscriberUpdated = await usersAccountsServices.cancelSubscription(
        req.user.subscriber.id,
        req.user.id
      );

      res.status(200).json({
        statusCode: 200,
        msg: "Subscription Cancelled!",
        data: subscriberUpdated,
      });
    }
  );
};

// Create comment
const createComment = async (req, res, next) => {
  const { articleId, text } = req.body;

  if (!articleId) {
    return res.status(400).json({
      statusCode: 400,
      msg: "articleId is missing",
    });
  }

  if (!validateId(articleId)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `articleId: ${articleId} - Invalid format!`,
    });
  }

  if (validateText(text)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateText(text),
    });
  }

  try {
    const article = await writerAccountServices.getArticleById(articleId);

    if (!article) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Article with ID: ${articleId} not found!`,
      });
    }

    if (
      article.forSubscribers === true &&
      req.user.subscriber.isActive === false
    ) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This article is for subscribers! Please subscribe to comment...",
      });
    }

    const commentCreated = await usersAccountsServices.createComment(
      req.user.id,
      articleId,
      text
    );

    if (commentCreated) {
      await Article.increment(
        {
          comments: 1,
        },
        {
          where: {
            id: articleId,
          },
        }
      );
    }

    const comment = await usersAccountsServices.getCommentById(
      commentCreated.id
    );

    res.status(201).json({
      statusCode: 201,
      msg: "Comment created successfully!",
      data: comment,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

// Get Article by id
const getArticleById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const article = await usersAccountsServices.getArticleById(id);

    if (!article) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Article with ID: ${id} not found!`,
      });
    }

    if (
      article.forSubscribers === true &&
      res.user.subscriber.isActive === false
    ) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This article is only for subscribers! You can not access to it...",
      });
    }

    const readerCreated = await Article.increment(
      { readers: 1 },
      { where: { id } }
    );

    res.status(200).json({
      statusCode: 400,
      msg: `${article.id} has a new reader!`,
      data: article,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get article comments
const getArticleComments = async (req, res, next) => {
  const { id } = req.params;
  const { page } = req.query;

  if (page) {
    if (validatePage(page)) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Page must be a number",
      });
    }

    if (parseInt(page) === 0) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }
  }

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const article = await usersAccountsServices.getArticleById(id);

    if (!article) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Article with ID: ${id} not found!`,
      });
    }

    if (
      article.forSubscribers === true &&
      req.user.subscriber.isActive === false
    ) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This article is only for subscribers! You can not access to it...",
      });
    }

    const comments = await usersAccountsServices.getArticleComments(
      page ? page : 1,
      id
    );

    if (!comments) {
      return res.status(404).json({
        statusCode: 404,
        msg: "There are no comments in this article!",
      });
    }

    if (!comments.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 400,
      data: comments,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get notifications
const getNotifications = async (req, res, next) => {
  const { page } = req.query;

  if (page) {
    if (validatePage(page)) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Page must be a number",
      });
    }

    if (parseInt(page) === 0) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }
  }
  try {
    const notifications = await usersAccountsServices.getNotifications(
      page ? page : 1,
      req.user.id
    );

    if (!notifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have notifications!",
      });
    }

    if (!notifications.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 400,
      ...notifications,
    });
  } catch (error) {
    return next(error);
  }
};

// Get not read notifications
const getNotReadNotifications = async (req, res, next) => {
  const { page } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    const notifications = await usersAccountsServices.getNotReadNotifications(
      page ? page : 1,
      req.user.id
    );

    if (!notifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have notifications!",
      });
    }

    if (!notifications.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...notifications,
    });
  } catch (error) {
    return next(error);
  }
};

// Update read notifications
const updateReadNotifications = async (req, res, next) => {
  try {
    const notReadNotifications =
      await usersAccountsServices.getNotReadNotifications(1, req.user.id);

    if (!notReadNotifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have not read notifications!",
      });
    }

    const notifications = await usersAccountsServices.updateReadNotifications(
      req.user.id
    );

    if (notifications) {
      res.status(200).json({
        statusCode: 200,
        msg: "All your notifications are read!",
      });
    }
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const notification = await usersAccountsServices.getNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Notification with ID: ${id} not found!`,
      });
    }

    if (notification.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a notification that is not yours!",
      });
    }

    const deletedNotification = await usersAccountsServices.deleteNotification(
      id
    );

    if (deletedNotification) {
      res.status(200).json({
        statusCode: 200,
        msg: "Notification deleted successfully!",
      });
    }
  } catch (error) {
    return next(error);
  }
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
  createComment,
  getArticleById,
  getArticleComments,
  getNotifications,
  getNotReadNotifications,
  updateReadNotifications,
  deleteNotification,
};

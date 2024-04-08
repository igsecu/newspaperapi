const bcrypt = require("bcryptjs");
const passport = require("passport");
const request = require("request");

const {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateId,
  validateName,
  validateBanned,
  validateIsShown,
  validateSubscribers,
  validatePage,
  validateLimit,
} = require("../utils/index");

const adminAccountServices = require("../services/adminAccount");
const writerAccountServices = require("../services/writerAccount");

require("dotenv").config();

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

// Create writer account
const createWriter = async (req, res, next) => {
  const { email, password, password2, sectionId } = req.body;
  try {
    // Validations
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await writerAccountServices.checkEmailExist(email);

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

    if (!sectionId) {
      return res.status(400).json({
        statusCode: 400,
        msg: "sectionId is missing",
      });
    }

    if (!validateId(sectionId)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `sectionId: ${sectionId} - Invalid format!`,
      });
    }

    const sectionFound = await adminAccountServices.getSectionById(sectionId);

    if (!sectionFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Section with ID: ${sectionId} not found!`,
      });
    }

    // Hash Password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return next("Error trying to create a new account");
        }
        try {
          const accountCreated = await writerAccountServices.createAccount(
            hash,
            email,
            sectionId
          );

          if (accountCreated) {
            const account = await writerAccountServices.getAccountById(
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

// Create section
const createSection = async (req, res, next) => {
  const { name } = req.body;

  if (validateName(name)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateName(name),
    });
  }

  try {
    const sectionFound = await adminAccountServices.checkSectionExist(name);

    if (sectionFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Section ${name} exists! Try with another name...`,
      });
    }

    const sectionCreated = await adminAccountServices.createSection(name);

    if (sectionCreated) {
      return res.status(201).json({
        statusCode: 201,
        data: {
          id: sectionCreated.id,
          name: sectionCreated.name,
        },
        msg: "Section created successfully!",
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Update article
const updateArticle = async (req, res, next) => {
  const { id } = req.params;
  const { subscribers, shown } = req.query;

  if (!validateId(id)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `ID: ${id} - Invalid format!`,
    });
  }

  try {
    let updatedArticle;

    if (subscribers) {
      if (validateSubscribers(subscribers)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateSubscribers(subscribers),
        });
      }

      updatedArticle = await adminAccountServices.updateArticleForSubscribers(
        id,
        subscribers.toLowerCase()
      );
    }

    if (shown) {
      if (validateIsShown(shown)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateIsShown(shown),
        });
      }

      updatedArticle = await adminAccountServices.updateArticleIsShown(
        id,
        shown.toLowerCase()
      );
    }

    if (!subscribers && !shown) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing!",
      });
    }

    if (!updatedArticle) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Article with ID: ${id} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      msg: `Article updated successfully!`,
      data: updatedArticle,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

// Update user account
const updateUserAccount = async (req, res, next) => {
  const { id } = req.params;
  const { banned } = req.query;

  if (!validateId(id)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `ID: ${id} - Invalid format!`,
    });
  }

  try {
    let updatedAccount;

    if (banned) {
      if (validateBanned(banned)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateBanned(banned),
        });
      }

      updatedAccount = await adminAccountServices.updateAccount(
        id,
        banned.toLowerCase()
      );
    }

    if (!banned) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing",
      });
    }

    if (!updatedAccount) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      msg: `Account updated successfully!`,
      data: updatedAccount,
    });
  } catch (error) {
    return next(error);
  }
};

// Update writer account
const updateWriterAccount = async (req, res, next) => {
  const { id } = req.params;
  const { banned } = req.query;

  if (!validateId(id)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `ID: ${id} - Invalid format!`,
    });
  }

  try {
    let updatedAccount;

    if (banned) {
      if (validateBanned(banned)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateBanned(banned),
        });
      }

      updatedAccount = await adminAccountServices.updateWriterAccount(
        id,
        banned.toLowerCase()
      );
    }

    if (!banned) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing",
      });
    }

    if (!updatedAccount) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      msg: `Account updated successfully!`,
      data: updatedAccount,
    });
  } catch (error) {
    return next(error);
  }
};

// Create Paypal Product
const createPaypalProduct = async (req, res, next) => {
  const product = {
    name: "Newspaper Subscription",
    description: "Monthly subscription to Newspaper app",
    type: "SERVICE",
    category: "SERVICES",
  };

  request.post(
    `${process.env.PAYPAL_API}/v1/catalogs/products`,
    {
      auth: {
        user: process.env.PAYPAL_CLIENT_ID,
        pass: process.env.PAYPAL_CLIENT_SECRET,
      },
      body: product,
      json: true,
    },
    (err, response) => {
      if (err) {
        return next("Error trying to create a new product in Paypal");
      }

      res.status(200).json({
        statusCode: 200,
        msg: "Paypal product created successfully!",
        data: response.body,
      });
    }
  );
};

// Create Paypal Plan
const createPaypalPlan = async (req, res, next) => {
  const plan = {
    name: "Monthly Subscription",
    product_id: process.env.PAYPAL_PRODUCT_ID,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: {
          interval_unit: "MONTH",
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: "3",
            currency_code: "USD",
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "3",
        currency_code: "USD",
      },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
    taxes: {
      percentage: "0",
      inclusive: false,
    },
  };

  request.post(
    `${process.env.PAYPAL_API}/v1/billing/plans`,
    {
      auth: {
        user: process.env.PAYPAL_CLIENT_ID,
        pass: process.env.PAYPAL_CLIENT_SECRET,
      },
      body: plan,
      json: true,
    },
    (err, response) => {
      if (err) {
        return next("Error trying to create a new paypal plan");
      }

      return res.status(200).json({
        statusCode: 200,
        msg: "Paypal Plan created successfully!",
        data: response.body,
      });
    }
  );
};

// Get Sections
const getSections = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const sections = await adminAccountServices.getSections(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!sections) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No sections saved in DB!",
      });
    }

    if (!sections.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...sections,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get Writers
const getWriters = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const writers = await adminAccountServices.getWriters(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!writers) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No writers saved in DB!",
      });
    }

    if (!writers.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...writers,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get Banned Writers
const getBannedWriters = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const writers = await adminAccountServices.getBannedWriters(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!writers) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No banned writers saved in DB!",
      });
    }

    if (!writers.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...writers,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get Not Banned Writers
const getNotBannedWriters = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const writers = await adminAccountServices.getNotBannedWriters(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!writers) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No not banned writers saved in DB!",
      });
    }

    if (!writers.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...writers,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get articles
const getArticles = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const articles = await adminAccountServices.getArticles(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No articles saved in DB!",
      });
    }

    if (!articles.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...articles,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get shown articles
const getShownArticles = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const articles = await adminAccountServices.getShownArticles(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No shown articles saved in DB!",
      });
    }

    if (!articles.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...articles,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get articles for subscribers
const getArticlesForSubscribers = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const articles = await adminAccountServices.getArticlesForSubscribers(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No articles for subscribers saved in DB!",
      });
    }

    if (!articles.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...articles,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get Users
const getUsers = async (req, res, next) => {
  const { page, limit } = req.query;
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

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const users = await adminAccountServices.getUsers(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!users) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No users saved in DB!",
      });
    }

    if (!users.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...users,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  createAccount,
  login,
  getLoggedInAccount,
  createWriter,
  createSection,
  updateArticle,
  updateUserAccount,
  updateWriterAccount,
  createPaypalProduct,
  createPaypalPlan,
  getSections,
  getWriters,
  getBannedWriters,
  getNotBannedWriters,
  getArticles,
  getShownArticles,
  getArticlesForSubscribers,
  getUsers,
};

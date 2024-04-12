const Account = require("../models/UsersAccount");
const Subscriber = require("../models/Subscriber");
const Comment = require("../models/Comment");
const WriterAccount = require("../models/WriterAccount");
const Section = require("../models/Section");
const Article = require("../models/Article");
const Notification = require("../models/Notification");

// Check if email exists
const checkEmailExist = async (email) => {
  try {
    const emailFound = await Account.findOne({
      where: {
        email,
      },
    });

    return emailFound;
  } catch (error) {
    throw new Error("Error trying to check if email exists");
  }
};

// Create account
const createAccount = async (hash, email) => {
  try {
    const accountCreated = await Account.create({
      password: hash,
      email: email.toLowerCase(),
    });

    return accountCreated;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to create new account");
  }
};

// Get account by id
const getAccountById = async (id) => {
  try {
    const account = await Account.findByPk(id, {
      attributes: ["id", "email", "isBanned", "isVerified"],
      include: {
        model: Subscriber,
        attributes: ["id", "isActive", "subscriptionId"],
      },
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        isBanned: account.isBanned,
        isVerified: account.isVerified,
        subscriber: {
          id: account.subscriber.id,
          isActive: account.subscriber.isActive,
          subscriptionId: account.subscriber.subscriptionId,
        },
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

// Delete Account
const deleteAccount = async (id) => {
  try {
    const deletedAccount = await Account.destroy({
      where: {
        id,
      },
    });

    if (deletedAccount) {
      return deletedAccount;
    }
  } catch (error) {
    throw new Error("Error trying to delete an account");
  }
};

// Update isVerified Account
const updateIsVerifiedAccount = async (id) => {
  try {
    const updatedAccount = await Account.update(
      {
        isVerified: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to verify account!");
  }
};

// Create Subscriber
const createSubscriber = async (id) => {
  try {
    const subscriberCreated = await Subscriber.create({
      usersAccountId: id,
    });

    return subscriberCreated;
  } catch (error) {
    throw new Error("Error trying to create a subscriber");
  }
};

// Update Subscriber
const updateSubscriber = async (id, subscriptionId, userId) => {
  try {
    const subscriberUpdated = await Subscriber.update(
      {
        isActive: true,
        subscriptionId,
      },
      {
        where: {
          id,
        },
      }
    );

    if (subscriberUpdated[0] === 1) {
      const account = await getAccountById(userId);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update subscriber!");
  }
};

// Cancel Subscription
const cancelSubscription = async (id, userId) => {
  try {
    const subscriberUpdated = await Subscriber.update(
      {
        isActive: false,
        subscriptionId: "",
      },
      {
        where: {
          id,
        },
      }
    );

    if (subscriberUpdated[0] === 1) {
      const account = await getAccountById(userId);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to cancel subscription!");
  }
};

// Create Comment
const createComment = async (userId, articleId, text) => {
  try {
    const commentCreated = await Comment.create({
      usersAccountId: userId,
      articleId,
      text,
    });

    return commentCreated;
  } catch (error) {
    throw new Error("Error trying to create a new comment");
  }
};

// Get Comment by Id
const getCommentById = async (id) => {
  try {
    const comment = await Comment.findByPk(id, {
      attributes: ["id", "text"],
      include: {
        model: Account,
        attributes: ["id", "email"],
      },
    });

    if (comment) {
      return {
        id: comment.id,
        text: comment.text,
        account: {
          id: comment.usersAccount.id,
          email: comment.usersAccount.email,
        },
      };
    }

    return comment;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get a comment by its id");
  }
};

// Get Article by id
const getArticleById = async (id) => {
  try {
    const article = await Article.findByPk(id, {
      attributes: [
        "id",
        "title",
        "subtitle",
        "introduction",
        "body",
        "photo",
        "comments",
        "readers",
        "forSubscribers",
        "isShown",
      ],
      include: [
        {
          model: WriterAccount,
          attributes: ["id", "email", "image"],
        },
        {
          model: Section,
          attributes: ["id", "name"],
        },
      ],
    });

    if (article) {
      return {
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        introduction: article.introduction,
        body: article.body,
        photo: article.photo,
        forSubscribers: article.forSubscribers,
        isShown: article.isShown,
        comments: article.comments,
        readers: article.readers,
        writer: {
          id: article.writerAccount.id,
          email: article.writerAccount.email,
          image: article.writerAccount.image,
        },
        section: {
          id: article.section.id,
          name: article.section.name,
        },
      };
    }

    return article;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get an article by id");
  }
};

// Get article comments
const getArticleComments = async (page, id) => {
  const results = [];
  try {
    const comments = await Comment.findAndCountAll({
      attributes: ["id", "text"],
      include: [
        {
          model: Article,
          where: {
            id,
          },
        },
        {
          model: Account,
          attributes: ["id", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
      offset: page * 10 - 10,
    });

    if (comments.count === 0) {
      return false;
    }

    if (comments.rows.length > 0) {
      comments.rows.forEach((c) => {
        results.push({
          id: c.id,
          text: c.text,
          account: {
            id: c.usersAccount.id,
            email: c.usersAccount.email,
          },
        });
      });

      return {
        totalResults: comments.count,
        totalPages: Math.ceil(comments.count / 10),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    throw new Error("Error trying to get article comments");
  }
};

// Get notifications
const getNotifications = async (page, id) => {
  const results = [];

  try {
    const notifications = await Notification.findAndCountAll({
      attributes: ["id", "text", "read"],
      include: {
        model: Account,
        where: {
          id,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
      offset: page * 10 - 10,
    });

    if (notifications.count === 0) {
      return false;
    }

    if (notifications.rows.length > 0) {
      notifications.rows.forEach((c) => {
        results.push({
          id: c.id,
          text: c.text,
          read: c.read,
        });
      });

      return {
        totalResults: notifications.count,
        totalPages: Math.ceil(notifications.count / 10),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get all notifications");
  }
};

// Get not read notifications
const getNotReadNotifications = async (page, id) => {
  const results = [];

  try {
    const notifications = await Notification.findAndCountAll({
      attributes: ["id", "text", "read"],
      where: {
        read: false,
      },
      include: {
        model: Account,
        where: {
          id,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
      offset: page * 10 - 10,
    });

    if (notifications.count === 0) {
      return false;
    }

    if (notifications.rows.length > 0) {
      notifications.rows.forEach((c) => {
        results.push({
          id: c.id,
          text: c.text,
          read: c.read,
        });
      });

      return {
        totalResults: notifications.count,
        totalPages: Math.ceil(notifications.count / 10),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get not read notifications");
  }
};

module.exports = {
  checkEmailExist,
  createAccount,
  getAccountById,
  deleteAccount,
  updateIsVerifiedAccount,
  createSubscriber,
  updateSubscriber,
  cancelSubscription,
  createComment,
  getCommentById,
  getArticleById,
  getArticleComments,
  getNotifications,
  getNotReadNotifications,
};

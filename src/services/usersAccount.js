const Account = require("../models/UsersAccount");
const Subscriber = require("../models/Subscriber");
const Comment = require("../models/Comment");

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
};

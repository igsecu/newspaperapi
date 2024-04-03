const WriterAccount = require("../models/WriterAccount");

// Create admin account
const createAccount = async (hash, email) => {
  try {
    const accountCreated = await WriterAccount.create({
      password: hash,
      email: email.toLowerCase(),
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create a new writer account");
  }
};

// Get Account by id
const getAccountById = async (id) => {
  try {
    const account = await WriterAccount.findByPk(id, {
      attributes: ["id", "email", "isBanned", "image"],
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        image: account.image,
        isBanned: account.isBanned,
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

// Check if email exists
const checkEmailExist = async (email) => {
  try {
    const emailFound = await WriterAccount.findOne({
      where: {
        email,
      },
    });

    return emailFound;
  } catch (error) {
    throw new Error("Error trying to check if email exists");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
};

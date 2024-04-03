const AdminAccount = require("../models/AdminAccount");

// Create admin account
const createAccount = async (hash, email) => {
  try {
    const accountCreated = await AdminAccount.create({
      password: hash,
      email: email.toLowerCase(),
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create a new admin account");
  }
};

// Get Account by id
const getAccountById = async (id) => {
  try {
    const account = await AdminAccount.findByPk(id, {
      attributes: ["id", "email"],
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
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
    const emailFound = await AdminAccount.findOne({
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

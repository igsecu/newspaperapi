const Account = require("../models/UsersAccount");

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
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        isBanned: account.isBanned,
        isVerified: account.isVerified,
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

module.exports = {
  checkEmailExist,
  createAccount,
  getAccountById,
  deleteAccount,
};

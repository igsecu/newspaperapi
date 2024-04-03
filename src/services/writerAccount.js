const WriterAccount = require("../models/WriterAccount");

const { deleteImage } = require("../utils/cloudinary");

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

// Update profile image
const updateProfileImage = async (id, image, image_id) => {
  try {
    const account = await WriterAccount.findByPk(id);

    if (account.image_id !== null) {
      await deleteImage(account.image_id);
    }

    const updatedAccount = await WriterAccount.update(
      {
        image,
        image_id,
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
    throw new Error("Error trying to update the writer account profile image!");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
  updateProfileImage,
};

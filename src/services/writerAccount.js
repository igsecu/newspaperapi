const WriterAccount = require("../models/WriterAccount");
const Section = require("../models/Section");

const { deleteImage } = require("../utils/cloudinary");

// Create admin account
const createAccount = async (hash, email, sectionId) => {
  try {
    const accountCreated = await WriterAccount.create({
      password: hash,
      email: email.toLowerCase(),
      sectionId,
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
      include: {
        model: Section,
        attributes: ["id", "name"],
      },
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        image: account.image,
        isBanned: account.isBanned,
        section: {
          id: account.section.id,
          name: account.section.name,
        },
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

// Delete profile image
const deleteProfileImage = async (id) => {
  try {
    const account = await WriterAccount.findByPk(id);

    if (account.image_id === null) {
      return null;
    }

    await deleteImage(account.image_id);

    const updatedAccount = await WriterAccount.update(
      {
        image: null,
        image_id: null,
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
    throw new Error("Error trying to delete writer profile image");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
  updateProfileImage,
  deleteProfileImage,
};

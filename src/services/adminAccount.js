const AdminAccount = require("../models/AdminAccount");
const Section = require("../models/Section");

const { Op } = require("sequelize");

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

// Check if section exists
const checkSectionExist = async (name) => {
  try {
    const sectionFound = await Section.findOne({
      where: {
        name: {
          [Op.iLike]: `${name}`,
        },
      },
    });

    return sectionFound;
  } catch (error) {
    throw new Error("Error trying to check if section exists");
  }
};

// Create section
const createSection = async (name) => {
  try {
    const sectionCreated = await Section.create({
      name: `${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`,
    });

    return sectionCreated;
  } catch (error) {
    throw new Error("Error trying to create a new section");
  }
};

// Get section by id
const getSectionById = async (id) => {
  try {
    const sectionFound = await Section.findByPk(id, {
      attributes: ["id", "name"],
    });

    if (sectionFound) {
      return {
        id: sectionFound.id,
        name: sectionFound.name,
      };
    }

    return sectionFound;
  } catch (error) {
    throw new Error("Error trying to get a section by its id");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
  checkSectionExist,
  createSection,
  getSectionById,
};

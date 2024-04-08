const AdminAccount = require("../models/AdminAccount");
const Section = require("../models/Section");
const Article = require("../models/Article");
const UsersAccount = require("../models/UsersAccount");
const WriterAccount = require("../models/WriterAccount");

const { Op } = require("sequelize");

const writerAccountServices = require("../services/writerAccount");
const usersAccountServices = require("../services/usersAccount");
const Subscriber = require("../models/Subscriber");

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

// For subscribers or not
const updateArticleForSubscribers = async (id, subscribers) => {
  try {
    const articleFound = await writerAccountServices.getArticleById(id);

    if (!articleFound) {
      return null;
    }

    if (subscribers === "true") {
      const updatedArticle = await Article.update(
        {
          forSubscribers: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedArticle[0] === 1) {
        const updatedArticle = await writerAccountServices.getArticleById(id);

        return updatedArticle;
      }
    } else {
      const updatedArticle = await Article.update(
        {
          forSubscribers: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedArticle[0] === 1) {
        const updatedArticle = await writerAccountServices.getArticleById(id);

        return updatedArticle;
      }
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the article!");
  }
};

// show or not article
const updateArticleIsShown = async (id, shown) => {
  try {
    const articleFound = await writerAccountServices.getArticleById(id);

    if (!articleFound) {
      return null;
    }

    if (shown === "true") {
      const updatedArticle = await Article.update(
        {
          isShown: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedArticle[0] === 1) {
        const articleFound = await writerAccountServices.getArticleById(id);

        return articleFound;
      }
    } else {
      const updatedArticle = await Article.update(
        {
          isShown: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedArticle[0] === 1) {
        const articleFound = await writerAccountServices.getArticleById(id);

        return articleFound;
      }
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update an article!");
  }
};

// Update account
const updateAccount = async (id, banned) => {
  try {
    const accountFound = await usersAccountServices.getAccountById(id);

    if (!accountFound) {
      return null;
    }

    if (banned === "true") {
      const updatedAccount = await UsersAccount.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount[0] === 1) {
        const updatedAccount = await usersAccountServices.getAccountById(id);

        return updatedAccount;
      }
    } else {
      const updatedAccount = await UsersAccount.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount[0] === 1) {
        const updatedAccount = await usersAccountServices.getAccountById(id);

        return updatedAccount;
      }
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the account!");
  }
};

// Update writer account
const updateWriterAccount = async (id, banned) => {
  try {
    const accountFound = await writerAccountServices.getAccountById(id);

    if (!accountFound) {
      return null;
    }

    if (banned === "true") {
      const updatedAccount = await WriterAccount.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount[0] === 1) {
        const updatedAccount = await writerAccountServices.getAccountById(id);

        return updatedAccount;
      }
    } else {
      const updatedAccount = await WriterAccount.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount[0] === 1) {
        const updatedAccount = await writerAccountServices.getAccountById(id);

        return updatedAccount;
      }
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update writer account!");
  }
};

// Get Sections
const getSections = async (page, limit) => {
  const results = [];
  try {
    const sections = await Section.findAndCountAll({
      attributes: ["id", "name"],
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (sections.count === 0) {
      return false;
    }

    if (sections.rows.length > 0) {
      sections.rows.forEach((s) => {
        results.push({
          id: s.id,
          name: s.name,
        });
      });

      return {
        totalResults: sections.count,
        totalPages: Math.ceil(sections.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all sections");
  }
};

// Get Writers
const getWriters = async (page, limit) => {
  const results = [];
  try {
    const writers = await WriterAccount.findAndCountAll({
      attributes: ["id", "email", "isBanned", "image"],
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (writers.count === 0) {
      return false;
    }

    if (writers.rows.length > 0) {
      writers.rows.forEach((w) => {
        results.push({
          id: w.id,
          email: w.email,
          isBanned: w.isBanned,
          image: w.image,
        });
      });

      return {
        totalResults: writers.count,
        totalPages: Math.ceil(writers.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all writers");
  }
};

// Get Banned Writers
const getBannedWriters = async (page, limit) => {
  const results = [];
  try {
    const writers = await WriterAccount.findAndCountAll({
      attributes: ["id", "email", "isBanned", "image"],
      where: {
        isBanned: true,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (writers.count === 0) {
      return false;
    }

    if (writers.rows.length > 0) {
      writers.rows.forEach((w) => {
        results.push({
          id: w.id,
          email: w.email,
          isBanned: w.isBanned,
          image: w.image,
        });
      });

      return {
        totalResults: writers.count,
        totalPages: Math.ceil(writers.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get banned writers");
  }
};

// Get Not Banned Writers
const getNotBannedWriters = async (page, limit) => {
  const results = [];
  try {
    const writers = await WriterAccount.findAndCountAll({
      attributes: ["id", "email", "isBanned", "image"],
      where: {
        isBanned: false,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (writers.count === 0) {
      return false;
    }

    if (writers.rows.length > 0) {
      writers.rows.forEach((w) => {
        results.push({
          id: w.id,
          email: w.email,
          isBanned: w.isBanned,
          image: w.image,
        });
      });

      return {
        totalResults: writers.count,
        totalPages: Math.ceil(writers.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get not banned writers");
  }
};

// Get Articles
const getArticles = async (page, limit) => {
  const results = [];
  try {
    const articles = await Article.findAndCountAll({
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
      include: {
        model: WriterAccount,
        attributes: ["id", "email"],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (articles.count === 0) {
      return false;
    }

    if (articles.rows.length > 0) {
      articles.rows.forEach((a) => {
        results.push({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          introduction: a.introduction,
          body: a.body,
          photo: a.photo,
          comments: a.comments,
          readers: a.readers,
          forSubscribers: a.forSubscribers,
          isShown: a.isShown,
          writer: {
            id: a.writerAccount.id,
            email: a.writerAccount.email,
          },
        });
      });

      return {
        totalResults: articles.count,
        totalPages: Math.ceil(articles.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all articles");
  }
};

// Get Shown Articles
const getShownArticles = async (page, limit) => {
  const results = [];
  try {
    const articles = await Article.findAndCountAll({
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
      where: {
        isShown: true,
      },
      include: {
        model: WriterAccount,
        attributes: ["id", "email"],
        where: {
          isBanned: false,
        },
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (articles.count === 0) {
      return false;
    }

    if (articles.rows.length > 0) {
      articles.rows.forEach((a) => {
        results.push({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          introduction: a.introduction,
          body: a.body,
          photo: a.photo,
          comments: a.comments,
          readers: a.readers,
          forSubscribers: a.forSubscribers,
          isShown: a.isShown,
          writer: {
            id: a.writerAccount.id,
            email: a.writerAccount.email,
          },
        });
      });

      return {
        totalResults: articles.count,
        totalPages: Math.ceil(articles.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get shown articles");
  }
};

// Get Articles for subscribers
const getArticlesForSubscribers = async (page, limit) => {
  const results = [];
  try {
    const articles = await Article.findAndCountAll({
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
      where: {
        forSubscribers: true,
      },
      include: {
        model: WriterAccount,
        attributes: ["id", "email"],
        where: {
          isBanned: false,
        },
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (articles.count === 0) {
      return false;
    }

    if (articles.rows.length > 0) {
      articles.rows.forEach((a) => {
        results.push({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          introduction: a.introduction,
          body: a.body,
          photo: a.photo,
          comments: a.comments,
          readers: a.readers,
          forSubscribers: a.forSubscribers,
          isShown: a.isShown,
          writer: {
            id: a.writerAccount.id,
            email: a.writerAccount.email,
          },
        });
      });

      return {
        totalResults: articles.count,
        totalPages: Math.ceil(articles.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get articles for subscribers");
  }
};

// Get Users
const getUsers = async (page, limit) => {
  const results = [];
  try {
    const users = await UsersAccount.findAndCountAll({
      attributes: ["id", "email", "isBanned", "isVerified"],
      include: {
        model: Subscriber,
        attributes: ["id", "isActive"],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (users.count === 0) {
      return false;
    }

    if (users.rows.length > 0) {
      users.rows.forEach((a) => {
        results.push({
          id: a.id,
          email: a.email,
          isBanned: a.isBanned,
          isVerified: a.isVerified,
          subscriber: {
            id: a.subscriber.id,
            isActive: a.subscriber.isActive,
          },
        });
      });

      return {
        totalResults: users.count,
        totalPages: Math.ceil(users.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all users");
  }
};

// Get Filtered Users
const getFilteredUsers = async (page, limit, banned, subscriber, verified) => {
  const results = [];
  try {
    const users = await UsersAccount.findAndCountAll({
      attributes: ["id", "email", "isBanned", "isVerified"],
      include: {
        model: Subscriber,
        attributes: ["id", "isActive"],
        where: {
          ...(subscriber
            ? { isActive: subscriber === "true" ? true : false }
            : {}),
        },
      },
      where: {
        ...(banned ? { isBanned: banned === "true" ? true : false } : {}),
        ...(verified ? { isVerified: verified === "true" ? true : false } : {}),
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (users.count === 0) {
      return false;
    }

    if (users.rows.length > 0) {
      users.rows.forEach((a) => {
        results.push({
          id: a.id,
          email: a.email,
          isBanned: a.isBanned,
          isVerified: a.isVerified,
          subscriber: {
            id: a.subscriber.id,
            isActive: a.subscriber.isActive,
          },
        });
      });

      return {
        totalResults: users.count,
        totalPages: Math.ceil(users.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get filtered users");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
  checkSectionExist,
  createSection,
  getSectionById,
  updateArticleForSubscribers,
  updateArticleIsShown,
  updateAccount,
  updateWriterAccount,
  getSections,
  getWriters,
  getBannedWriters,
  getNotBannedWriters,
  getArticles,
  getShownArticles,
  getArticlesForSubscribers,
  getUsers,
  getFilteredUsers,
};

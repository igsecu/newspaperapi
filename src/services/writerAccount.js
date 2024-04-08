const WriterAccount = require("../models/WriterAccount");
const Section = require("../models/Section");
const Article = require("../models/Article");

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

// Create article
const createArticle = async (
  title,
  subtitle,
  introduction,
  body,
  writerId,
  sectionId
) => {
  try {
    const articleCreated = await Article.create({
      title,
      subtitle,
      introduction,
      body,
      writerAccountId: writerId,
      sectionId,
    });

    return articleCreated;
  } catch (error) {
    throw new Error("Error trying to create a new article");
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

// Update article image
const updateArticleImage = async (id, image, image_id) => {
  try {
    const article = await Article.findByPk(id);

    if (article.photo_id !== null) {
      await deleteImage(article.photo_id);
    }

    const updatedArticle = await Article.update(
      {
        photo: image,
        photo_id: image_id,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedArticle[0] === 1) {
      const article = await getArticleById(id);

      return article;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update article image");
  }
};

// Get Articles
const getArticles = async (page, limit, id) => {
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
        where: {
          id,
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
    throw new Error("Error trying to get all articles");
  }
};

module.exports = {
  createAccount,
  getAccountById,
  checkEmailExist,
  updateProfileImage,
  deleteProfileImage,
  createArticle,
  getArticleById,
  updateArticleImage,
  getArticles,
};

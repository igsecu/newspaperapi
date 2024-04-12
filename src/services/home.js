const Article = require("../models/Article");
const WriterAccount = require("../models/WriterAccount");
const Section = require("../models/Section");

// Get last articles
const getLastArticles = async () => {
  const results = [];
  try {
    const articles = await Article.findAll({
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
          isBanned: false,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    if (articles) {
      articles.forEach((a) => {
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
    }

    return results;
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get last articles");
  }
};

// Get articles more readers
const getArticlesMoreReaders = async () => {
  const results = [];
  try {
    const articles = await Article.findAll({
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
          isBanned: false,
        },
      },
      order: [["readers", "DESC"]],
      limit: 10,
    });

    if (articles) {
      articles.forEach((a) => {
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
    }

    return results;
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get articles with more readers");
  }
};

// Get shown articles
const getArticles = async () => {
  const results = [];
  try {
    const articles = await Article.findAll({
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
    });

    if (articles) {
      articles.forEach((a) => {
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
    }

    return results;
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all articles");
  }
};

// Get Section by id
const getSectionById = async (id) => {
  try {
    const section = await Section.findByPk(id, {
      attributes: ["id", "name"],
    });

    if (section) {
      return {
        id: section.id,
        name: section.name,
      };
    }

    return section;
  } catch (error) {
    throw new Error("Error trying to get a section by its id");
  }
};

// Get articles by section
const getArticlesBySection = async (page, id) => {
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
          sectionId: id,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
      offset: page * 10 - 10,
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
        totalPages: Math.ceil(articles.count / 10),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error trying to get all articles by section");
  }
};

module.exports = {
  getArticles,
  getArticlesMoreReaders,
  getLastArticles,
  getSectionById,
  getArticlesBySection,
};

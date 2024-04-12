const Article = require("../models/Article");
const WriterAccount = require("../models/WriterAccount");

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

module.exports = {
  getArticles,
  getArticlesMoreReaders,
};

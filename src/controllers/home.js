const homeServices = require("../services/home");

const Redis = require("ioredis");
const client = new Redis();

const { validateId, validatePage } = require("../utils/index");

// Get last articles
const getLastArticles = async (req, res, next) => {
  try {
    const articles = await homeServices.getLastArticles();

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No articles to show!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: articles,
    });
  } catch (error) {
    return next(error);
  }
};

// Get articles more readers
const getArticlesMoreReaders = async (req, res, next) => {
  try {
    const articles = await homeServices.getArticlesMoreReaders();

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No articles to show!",
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: articles,
    });
  } catch (error) {
    return next(error);
  }
};

// Get shown not banned articles
const getArticles = async (req, res, next) => {
  try {
    const articles = await homeServices.getArticles();

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No articles to show!`,
      });
    }

    // Set data to redis
    client.setex("home_articles", 3600, JSON.stringify(articles));

    res.status(200).json({
      statusCode: 200,
      data: articles,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Articles by section
const getArticlesBySection = async (req, res, next) => {
  const { id } = req.params;
  const { page } = req.query;

  if (!validateId(id)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `ID: ${id} - Invalid format!`,
    });
  }

  if (page) {
    if (validatePage(page)) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Page must be a number",
      });
    }

    if (parseInt(page) === 0) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }
  }

  try {
    const sectionFound = await homeServices.getSectionById(id);

    if (!sectionFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Section with ID: ${id} not found!`,
      });
    }

    const articles = await homeServices.getArticlesBySection(
      page ? page : 1,
      id
    );

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "There are no articles in this section!",
      });
    }

    if (!articles.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...articles,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Articles by writer
const getArticlesByWriter = async (req, res, next) => {
  const { id } = req.params;
  const { page } = req.query;

  if (!validateId(id)) {
    return res.status(400).json({
      statusCode: 400,
      msg: `ID: ${id} - Invalid format!`,
    });
  }

  if (page) {
    if (validatePage(page)) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Page must be a number",
      });
    }

    if (parseInt(page) === 0) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }
  }

  try {
    const writerFound = await homeServices.getWriterById(id);

    if (!writerFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Writer with ID: ${id} not found!`,
      });
    }

    if (writerFound.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This writer is banned! You can not access to the articles...",
      });
    }

    const articles = await homeServices.getArticlesByWriter(
      page ? page : 1,
      id
    );

    if (!articles) {
      return res.status(404).json({
        statusCode: 404,
        msg: "This writer does not have articles to show!",
      });
    }

    if (!articles.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...articles,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getArticles,
  getArticlesMoreReaders,
  getLastArticles,
  getArticlesBySection,
  getArticlesByWriter,
};

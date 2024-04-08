const homeServices = require("../services/home");

const Redis = require("ioredis");
const client = new Redis();

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

    console.log("Controller");

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

module.exports = {
  getArticles,
};

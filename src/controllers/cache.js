const Redis = require("ioredis");
const redisClient = new Redis();

// Cache middleware
const homeArticlesFromCache = (req, res, next) => {
  redisClient.get("home_articles", (err, data) => {
    if (err) return next("Error trying to get home articles from cache");

    if (data !== null) {
      return res.status(200).json({
        statusCode: 200,
        data: JSON.parse(data),
      });
    } else {
      next();
    }
  });
};

module.exports = {
  homeArticlesFromCache,
};

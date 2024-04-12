const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home");

const { homeArticlesFromCache } = require("../controllers/cache");

// Get articles by writer
router.get("/articles/writer/:id", homeController.getArticlesByWriter);
// Get articles by section
router.get("/articles/section/:id", homeController.getArticlesBySection);
// Get last articles
router.get("/articles/last", homeController.getLastArticles);
// Get more readers articles
router.get("/articles/readers", homeController.getArticlesMoreReaders);
// Get shown articles
router.get("/articles", homeArticlesFromCache, homeController.getArticles);

module.exports = router;

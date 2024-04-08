const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home");

const { homeArticlesFromCache } = require("../controllers/cache");

// Get shown articles
router.get("/articles", homeArticlesFromCache, homeController.getArticles);

module.exports = router;

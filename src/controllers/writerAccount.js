const bcrypt = require("bcryptjs");
const passport = require("passport");

const {
  validateEmail,
  validateImageSize,
  validateFileType,
  validateTitle,
  validateSubtitle,
  validateIntroduction,
  validateBody,
} = require("../utils/index");

const writerAccountServices = require("../services/writerAccount");

const fsExtra = require("fs-extra");

const { uploadWriterImage } = require("../utils/cloudinary");

// Login process
const login = async (req, res, next) => {
  if (req.user) {
    return res.status(400).json({
      statusCode: 400,
      msg: "An user is already logged in!",
    });
  }

  const { email, password } = req.body;

  if (validateEmail(email)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateEmail(email),
    });
  }

  if (!password) {
    return res.status(400).json({
      statusCode: 400,
      msg: "Password is missing",
    });
  }

  passport.authenticate("writer", (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      if (info.statusCode === 400) {
        return res.status(400).json({
          statusCode: info.statusCode,
          msg: info.msg,
        });
      }
      return res.status(404).json({
        statusCode: info.statusCode,
        msg: info.msg,
      });
    }
    req.logIn(user, (error) => {
      if (error) {
        console.log(error.message);
        return next(error);
      }
      return res.status(200).json({
        statusCode: 200,
        msg: "You logged in successfully",
      });
    });
  })(req, res, next);
};

// Get logged in account
const getLoggedInAccount = async (req, res, next) => {
  if (req.user && req.user.type === "WRITER") {
    const account = await writerAccountServices.getAccountById(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      data: account,
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      msg: `No Writer Account logged in`,
    });
  }
};

// Update profile image
const updateProfileImage = async (req, res, next) => {
  try {
    if (req.files?.image) {
      if (await validateFileType(req.files.image.tempFilePath)) {
        const message = await validateFileType(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      if (await validateImageSize(req.files.image.tempFilePath)) {
        const message = await validateImageSize(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      const result = await uploadWriterImage(req.files.image.tempFilePath);

      await fsExtra.unlink(req.files.image.tempFilePath);

      const userUpdated = await writerAccountServices.updateProfileImage(
        req.user.id,
        result.secure_url,
        result.public_id
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Your profile image was updated successfully!",
        data: userUpdated,
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        msg: "Image file is missing!",
      });
    }
  } catch (error) {
    await fsExtra.unlink(req.files.image.tempFilePath);
    console.log(error.message);
    return next(error);
  }
};

// Delete profile image
const deleteProfileImage = async (req, res, next) => {
  try {
    const account = await writerAccountServices.deleteProfileImage(req.user.id);

    if (account === null) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You do not have a profile image to delete!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      msg: "Profile image deleted successfully!",
      data: account,
    });
  } catch (error) {
    console.log(error.message);
    return next("Error trying to delete writer account profile image");
  }
};

// Create article
const createArticle = async (req, res, next) => {
  const { title, subtitle, introduction, body } = req.body;

  if (validateTitle(title)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateTitle(title),
    });
  }

  if (validateSubtitle(subtitle)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateSubtitle(subtitle),
    });
  }

  if (validateIntroduction(introduction)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateIntroduction(introduction),
    });
  }

  if (validateBody(body)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateBody(body),
    });
  }

  try {
    const articleCreated = await writerAccountServices.createArticle(
      title,
      subtitle,
      introduction,
      body,
      req.user.id,
      req.user.section.id
    );

    if (articleCreated) {
      const article = await writerAccountServices.getArticleById(
        articleCreated.id
      );

      return res.status(201).json({
        statusCode: 201,
        msg: "Article created successfully!",
        data: article,
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLoggedInAccount,
  login,
  updateProfileImage,
  deleteProfileImage,
  createArticle,
};

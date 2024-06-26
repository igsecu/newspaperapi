require("dotenv").config();
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadWriterImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "/newspaper/writers",
  });
};

const uploadArticleImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "/newspaper/articles",
  });
};

const deleteImage = async (image_id) => {
  return await cloudinary.uploader.destroy(image_id);
};

module.exports = {
  uploadWriterImage,
  uploadArticleImage,
  deleteImage,
};

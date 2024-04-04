const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Article = db.define(
  "article",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    introduction: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    photo_id: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    readers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    forSubscribers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isShown: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: true,
  }
);

module.exports = Article;

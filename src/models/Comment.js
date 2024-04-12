const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Comment = db.define(
  "newsComment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: true,
  }
);

module.exports = Comment;

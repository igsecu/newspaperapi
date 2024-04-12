const { DataTypes } = require("sequelize");
const db = require("../../db");

const Comment = db.define(
  "comment",
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

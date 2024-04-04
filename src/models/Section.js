const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Section = db.define(
  "section",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    createdAt: true,
  }
);

module.exports = Section;

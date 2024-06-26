const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Subscriber = db.define(
  "subscriber",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscriptionId: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    timestamps: true,
    createdAt: true,
  }
);

module.exports = Subscriber;

const { DataTypes } = require("sequelize");
const db = require("../database/db");

const AdminAccount = db.define(
  "adminAccount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
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

module.exports = AdminAccount;

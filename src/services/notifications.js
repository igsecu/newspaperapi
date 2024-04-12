const Notification = require("../models/Notification");

// Create Notification
const createNotification = async (id, text) => {
  try {
    await Notification.create({
      usersAccountId: id,
      text,
    });
  } catch (error) {
    throw new Error("Error trying to create notification");
  }
};

module.exports = {
  createNotification,
};

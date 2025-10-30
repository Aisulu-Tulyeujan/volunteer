const { v4: uuidv4 } = require("uuid");

let notifications = [];

const getNotifications = (req, res) => {
  res.json(notifications);
};

const createNotification = (req, res) => {
  const { type, message, userId } = req.body;
  if (!type || !message) {
    return res.status(400).json({ error: "Type and message are required." });
  }

  const newNotif = {
    id: uuidv4(),
    type,
    message,
    userId: userId || null,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotif);
  res.status(201).json(newNotif);
};

const markNotificationRead = (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: "Notification not found" });
  notif.read = true;
  res.json(notif);
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
};

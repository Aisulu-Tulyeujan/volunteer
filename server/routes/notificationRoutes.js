const express = require('express');
const {
  getNotifications,
  createNotification,
  markNotificationRead
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markNotificationRead);

module.exports = router;


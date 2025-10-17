const express = require('express');
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/my-history', authMiddleware, historyController.getHistory);

module.exports = router;

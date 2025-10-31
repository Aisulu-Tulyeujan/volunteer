const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get("/profile", auth, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});
router.get("/admin-only", auth, admin, (req, res) => {
    res.json({ message: "Welcome Admin" });
});

module.exports = router;

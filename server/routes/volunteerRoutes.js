const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.get('/', volunteerController.getProfiles);
router.post('/', volunteerController.createProfile);
router.put('/:id', volunteerController.updateProfile);
router.delete('/:id', volunteerController.deleteProfile);

module.exports = router;

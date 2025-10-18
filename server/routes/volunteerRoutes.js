const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

// get all volunteer profiles
router.get('/', volunteerController.getProfiles);

router.post('/', volunteerController.createProfile);

router.put('/:email', volunteerController.updateProfile);

router.delete('/:name', volunteerController.deleteProfile);

module.exports = router;

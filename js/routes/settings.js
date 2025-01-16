const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');


// Get user
router.get('/profile', auth, settingsController.getUser);

// Change password
router.post('/change_password', auth, settingsController.changePass);


module.exports = router;
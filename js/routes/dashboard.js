const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/cards', auth, dashboardController.getAllCard);

router.get('/doctors', auth, dashboardController.getAllDoctor);

router.get('/getUserStatus', auth, dashboardController.getUserStatus)

module.exports = router;
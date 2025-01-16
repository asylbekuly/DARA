const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (req.user.who !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

router.post('/addDoctor', auth, checkAdmin, doctorController.addDoctor);

module.exports = router;
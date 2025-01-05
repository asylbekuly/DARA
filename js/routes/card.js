const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cardController = require('../controllers/cardController');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.user.who !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};



// Create new card
router.post('/cards', auth, checkAdmin, cardController.createCard);

// Get all courses
router.get('/cards', auth, cardController.getAllCard);

// Delete card
router.delete('/cards/:id', auth, checkAdmin, cardController.deleteCard);

//  Update card
router.put('/cards/:id', auth, checkAdmin, cardController.updateCard);

//  Update Status
router.put('/cards/status/:id', auth, cardController.updateCardStatus);

module.exports = router;
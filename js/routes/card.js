const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cardController = require('../controllers/cardController');

// Middleware to check admin role
// const checkAdmin = (req, res, next) => {
//     if (req.user.who !== 'doctor') {
//         return res.status(403).json({ success: false, message: 'Access denied' });
//     }
//     next();
// };



// Create new card
router.post('/cards', auth, cardController.createCard);

// Get all courses
router.get('/cards', auth, cardController.getAllCard);

// Delete card
router.delete('/cards/:id', auth, cardController.deleteCard);

//  Update card
router.put('/cards/:id', auth, cardController.updateCard);

module.exports = router;
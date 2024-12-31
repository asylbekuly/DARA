const Card = require('../models/Card');

// Create new card
exports.createCard = async (req, res) => {
    const { fullName, patient_id, doctor, appoinment_date, add_info } = req.body;

    try {
        const card = new Card({ fullName, patient_id, doctor, appoinment_date, add_info });
        await card.save();
        res.json({ success: true, message: 'Card created successfully', card });
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all courses
exports.getAllCard = async (req, res) => {
    try {
        const card = await Card.find()

        const cardWithDetails = card.map(card => ({
            _id: card._id,
            fullName: card.fullName,
            patient_id: card.patient_id,
            doctor: card.doctor,
            appoinment_date: card.appoinment_date,
            status: card.status,
            add_info: card.add_info
        }));

        res.json({ success: true, cards: cardWithDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Delete card
exports.deleteCard = async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        res.json({ success: true, message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//  Update card
exports.updateCard = async (req, res) => {
    try {
        const { fullName, patient_id, doctor, appoinment_date, add_info } = req.body;
        const cardId = req.params.id;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        card.fullName = fullName;
        card.patient_id = patient_id;
        card.doctor = doctor;
        card.appoinment_date = appoinment_date;
        card.add_info = add_info;
        await card.save();

        res.json({ success: true, message: 'Card updated successfully', card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//  Update status
exports.updateCardStatus = async (req, res) => {
    try {
        const { newStatus } = req.body;
        const cardId = req.params.id;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        card.status = newStatus;

        await card.save();

        res.json({ success: true, message: 'Card updated successfully', card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
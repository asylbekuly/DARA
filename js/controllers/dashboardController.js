const Card = require('../models/Card');
const User = require('../models/User');

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

exports.getAllDoctor = async (req, res) => {
  try {
    const doctor = await User.find()

    const doctorWithDetails = doctor.map(doctor => ({
      fullname: doctor.fullname,
      profession: doctor.profession
    }));

    res.json({ success: true, doctor: doctorWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.getUserStatus = async (req, res) => {
  try {
    const user = req.user

    const who = user.who;

    res.json({ success: true, who: who });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
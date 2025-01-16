const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
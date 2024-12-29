const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    patient_id: { type: String, required: true },
    doctor: {type: String, required: true},
    appoinment_date: {type: Date, required: true},
    add_info: {type: String},
    status: {type: String, default: "waiting"},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', CardSchema);
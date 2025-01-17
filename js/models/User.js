const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    profession: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    who: { type: String, default: 'doctor' },
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    tempSecret: { type: String }
});

module.exports = mongoose.model('User', UserSchema);
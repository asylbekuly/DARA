const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Doctor = require('../models/Doctor');

exports.register = async (req, res) => {
  const { email, password, fullname, profession, enable2FA } = req.body;
  console.log('Register request received:', { email, password, fullname });

  try {
    let doctor = await Doctor.findOne({ email });
    let user = await User.findOne({ email });
    if (!doctor) {
      console.log('there is no email');
      return res.status(400).json({ msg: 'Access denied to register' });
    }
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ email, password, fullname, profession });
    console.log('Creating new user:', user);
    if (enable2FA) {
      const secret = speakeasy.generateSecret({
        name: `EduPlatform:${email}`
      });
      user.tempSecret = secret.base32;

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.json({
        requiresOTP: true,
        qrCode: qrCodeUrl,
        tempSecret: secret.base32,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log('Password hashed');

      await user.save();
      console.log('User saved to database');

      const payload = { user: { id: user.id } };

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        console.log('JWT token generated');
        res.json({ token });
      });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'No User' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      return res.json({
        requiresOTP: true,
        userId: user.id,
        msg: '2FA verification required'
      });
    }

    const payload = { user: { id: user.id, who: user.who } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, who: user.who });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.isRegistered = async (req, res) => {
  const { email } = req.query;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ registered: true });
    } else {
      return res.status(200).json({ registered: false });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.verify2FALogin = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified) {
      const payload = { user: { id: user.id, who: user.who } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token, who: user.who });
      });
    } else {
      res.status(400).json({ msg: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.verify2FA = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.tempSecret) {
      return res.status(400).json({ msg: 'No temporary secret found. Please register again.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.tempSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow for 2 time steps in case of slight time mismatch
    });

    if (verified) {
      user.twoFactorSecret = user.tempSecret;
      user.twoFactorEnabled = true;
      user.tempSecret = undefined;
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } else {
      res.status(400).json({ msg: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
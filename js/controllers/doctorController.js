const Doctor = require('../models/Doctor');

exports.addDoctor = async (req, res) => {
  const { email } = req.body;
  try {
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      console.log('Doctor already exists');
      return res.status(400).json({ message: 'Doctor already exists' });
    }
    doctor = new Doctor({ email });
    console.log('Adding new doctor:', doctor);
    await doctor.save();
    console.log('Doctor added to database');
    res.json({ message: 'Doctor added' });
  } catch {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
}
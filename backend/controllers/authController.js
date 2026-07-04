const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });
    
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Admin identifier already in active records' });

    const admin = await Admin.create({ username, password });
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid admin credentials profile matching failed' });
    }
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

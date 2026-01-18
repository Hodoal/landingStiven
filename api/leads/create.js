require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('../../../backend/models/Lead');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    }

    if (req.method === 'POST') {
      const { name, email, phone, status } = req.body;
      const newLead = new Lead({ name, email, phone, status });
      await newLead.save();
      res.status(201).json({ success: true, data: newLead });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

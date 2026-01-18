require('dotenv').config();
const mongoose = require('mongoose');
const Consultant = require('../../../backend/models/Consultant');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    }

    if (req.method === 'GET') {
      const consultants = await Consultant.find();
      res.status(200).json({ success: true, data: consultants });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

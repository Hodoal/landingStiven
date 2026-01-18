require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../../../backend/models/Booking');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const booking = await Booking.findByIdAndDelete(id);

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      res.status(200).json({ success: true, message: 'Booking deleted' });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

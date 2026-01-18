require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../../backend/models/Booking');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads', {
    maxPoolSize: 5,
    minPoolSize: 1,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000
  });
  isConnected = true;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const bookings = await Booking.find().lean().timeout(5000);
      res.status(200).json({ success: true, data: bookings });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

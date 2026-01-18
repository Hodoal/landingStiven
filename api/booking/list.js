require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../../backend/models/Booking');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 20000,
    retryWrites: true,
    w: 'majority'
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
      const bookings = await Booking.find().lean().maxTimeMS(30000);
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

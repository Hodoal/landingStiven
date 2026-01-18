require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoConnection } = require('../lib/db');
const Booking = require('../../backend/models/Booking');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to MongoDB...');
    await getMongoConnection();
    console.log('Connected. Fetching bookings...');

    const bookings = await Booking.find().lean().maxTimeMS(30000);
    console.log(`Found ${bookings.length} bookings`);
    
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

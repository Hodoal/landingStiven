require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoConnection } = require('../lib/db');
const Booking = require('../../backend/models/Booking');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await getMongoConnection();

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
      message: error.messarequire('dotenv').confi cat > /Users/javier/Desktop/landing_stiven/api/leads/admin/leads.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoConnection } = require('../../lib/db');
const Lead = require('../../../backend/models/Lead');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await getMongoConnection();

    if (req.method === 'GET') {
      const leads = await Lead.find().lean().maxTimeMS(30000);
      res.status(200).json({ success: true, data: leads });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple test routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Later routes will try MongoDB
app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', node_env: process.env.NODE_ENV });
});

// MongoDB routes
app.get('/api/booking/list', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 20000,
        serverSelectionTimeoutMS: 20000
      });
    }
    
    const Booking = require('./backend/models/Booking');
    const bookings = await Booking.find().lean().maxTimeMS(30000);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/leads/admin/leads', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 20000,
        serverSelectionTimeoutMS: 20000
      });
    }
    
    const Lead = require('./backend/models/Lead');
    const leads = await Lead.find().lean().maxTimeMS(30000);
    res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
}

module.exports = app;

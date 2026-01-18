require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('MongoDB connection error:', err.message);
  });

// Rutas
const bookingRoutes = require('../backend/routes/bookingRoutes');
const calendarRoutes = require('../backend/routes/calendarRoutes');
const leadsRoutes = require('../backend/routes/leadsRoutes');
const consultantRoutes = require('../backend/routes/consultantRoutes');

app.use('/api/booking', bookingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/consultants', consultantRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;

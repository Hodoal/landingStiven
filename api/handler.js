require('dotenv').config();

module.exports = (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Health check
    if (req.url === '/api/health' || req.url === '/health') {
      res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
      });
      return;
    }

    // Root
    if (req.url === '/' || req.url === '') {
      res.status(200).json({ message: 'Stivenads Backend is running' });
      return;
    }

    // API routes - ahora usa Express app
    const express = require('express');
    const cors = require('cors');
    const mongoose = require('mongoose');
    const bodyParser = require('body-parser');

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
    if (!mongoose.connections[0].readyState) {
      mongoose.connect(MONGODB_URI).catch(err => console.warn('MongoDB error:', err.message));
    }

    // Rutas
    app.use('/api/booking', require('../backend/routes/bookingRoutes'));
    app.use('/api/calendar', require('../backend/routes/calendarRoutes'));
    app.use('/api/leads', require('../backend/routes/leadsRoutes'));
    app.use('/api/consultants', require('../backend/routes/consultantRoutes'));

    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    });

    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

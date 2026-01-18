require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 20000,
  serverSelectionTimeoutMS: 20000
}).catch(err => console.error('MongoDB connection error:', err.message));

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', environment: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Diagnostics endpoint
app.get('/api/diagnostics', (req, res) => {
  res.json({
    message: 'Backend diagnostics',
    nodeEnv: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing',
    routes: {
      consultants: 'checking...',
      booking: 'checking...',
      calendar: 'checking...',
      leads: 'checking...'
    }
  });
});

// Try to import and use routes
try {
  const consultantRoutes = require(path.join(__dirname, '../backend/routes/consultantRoutes'));
  app.use('/api/consultants', consultantRoutes);
  console.log('✅ Consultant routes loaded');
} catch (err) {
  console.error('❌ Failed to load consultant routes:', err.message);
  app.get('/api/consultants', (req, res) => {
    res.status(500).json({ error: 'Consultant routes not loaded', details: err.message });
  });
}

try {
  const bookingRoutes = require(path.join(__dirname, '../backend/routes/bookingRoutes'));
  app.use('/api/booking', bookingRoutes);
  console.log('✅ Booking routes loaded');
} catch (err) {
  console.error('❌ Failed to load booking routes:', err.message);
}

try {
  const calendarRoutes = require(path.join(__dirname, '../backend/routes/calendarRoutes'));
  app.use('/api/calendar', calendarRoutes);
  console.log('✅ Calendar routes loaded');
} catch (err) {
  console.error('❌ Failed to load calendar routes:', err.message);
}

try {
  const leadsRoutes = require(path.join(__dirname, '../backend/routes/leadsRoutes'));
  app.use('/api/leads', leadsRoutes);
  console.log('✅ Leads routes loaded');
} catch (err) {
  console.error('❌ Failed to load leads routes:', err.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
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

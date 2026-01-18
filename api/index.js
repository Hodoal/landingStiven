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

// Import Routes - with error handling
let bookingRoutes, calendarRoutes, leadsRoutes, consultantRoutes;

try {
  bookingRoutes = require(path.join(__dirname, '../backend/routes/bookingRoutes'));
  calendarRoutes = require(path.join(__dirname, '../backend/routes/calendarRoutes'));
  leadsRoutes = require(path.join(__dirname, '../backend/routes/leadsRoutes'));
  consultantRoutes = require(path.join(__dirname, '../backend/routes/consultantRoutes'));
  console.log('✅ All routes imported successfully');
} catch (err) {
  console.error('❌ Error importing routes:', err.message);
  console.error('Stack:', err.stack);
}

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', environment: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes - only if imported successfully
if (bookingRoutes) app.use('/api/booking', bookingRoutes);
if (calendarRoutes) app.use('/api/calendar', calendarRoutes);
if (leadsRoutes) app.use('/api/leads', leadsRoutes);
if (consultantRoutes) app.use('/api/consultants', consultantRoutes);

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

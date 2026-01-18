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

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.warn('⚠️ MongoDB connection error:', err.message));
}

// Rutas
app.use('/api/booking', require('../backend/routes/bookingRoutes'));
app.use('/api/calendar', require('../backend/routes/calendarRoutes'));
app.use('/api/leads', require('../backend/routes/leadsRoutes'));
app.use('/api/consultants', require('../backend/routes/consultantRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Stivenads Backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Exportar para Vercel
module.exports = app;

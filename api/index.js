require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Importar rutas del backend
const bookingRoutes = require('../backend/routes/bookingRoutes');
const calendarRoutes = require('../backend/routes/calendarRoutes');
const leadsRoutes = require('../backend/routes/leadsRoutes');
const consultantRoutes = require('../backend/routes/consultantRoutes');

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

// Registrar rutas del backend
app.use('/api/booking', bookingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/consultants', consultantRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', environment: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', node_env: process.env.NODE_ENV });
});

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

// Server startup
const PORT = process.env.PORT || 3001;

// Only start server if not in a serverless environment
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads'}`);
  });
}

module.exports = app;

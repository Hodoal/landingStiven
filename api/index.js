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

// Define Consultant Schema
const consultantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  specialization: String,
  bio: String,
  hourlyRate: Number,
  isActive: { type: Boolean, default: true },
  availability: Object,
  unavailableDates: [Object],
  createdAt: { type: Date, default: Date.now }
});

const Consultant = mongoose.model('Consultant', consultantSchema);

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

// === CONSULTANTS ENDPOINTS ===

// GET /api/consultants - Get all active consultants
app.get('/api/consultants', async (req, res) => {
  try {
    const consultants = await Consultant.find({ isActive: true })
      .select('name email specialization bio profileImage')
      .lean()
      .exec();

    res.json({
      success: true,
      data: consultants,
      count: consultants.length
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener consultores',
      details: error.message 
    });
  }
});

// GET /api/consultants/:id - Get consultant details
app.get('/api/consultants/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id).lean();

    if (!consultant) {
      return res.status(404).json({ success: false, error: 'Consultor no encontrado' });
    }

    res.json({ success: true, data: consultant });
  } catch (error) {
    console.error('Error fetching consultant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

module.exports = app;

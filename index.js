require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let mongoConnected = false;

async function connectMongo() {
  if (mongoConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 20000,
    bufferTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority',
    family: 4
  });
  mongoConnected = true;
}

app.get('/', (req, res) => {
  res.json({ message: 'Stivenads Backend running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured' });
});

app.get('/api/booking/list', async (req, res) => {
  try {
    await connectMongo();
    const Booking = require('../backend/models/Booking');
    const bookings = await Booking.find().lean().maxTimeMS(30000);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/leads/admin/leads', async (req, res) => {
  try {
    await connectMongo();
    const Lead = require('../backend/models/Lead');
    const leads = await Lead.find().lean().maxTimeMS(30000);
    res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/booking/confirm-sale', async (req, res) => {
  try {
    await connectMongo();
    const { id } = req.query;
    const { monto_venta, estado } = req.body;
    const Booking = require('../backend/models/Booking');
    const booking = await Booking.findByIdAndUpdate(id, { monto_venta, estado, sale_completed_at: new Date() }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/booking/delete', async (req, res) => {
  try {
    await connectMongo();
    const { id } = req.query;
    const Booking = require('../backend/models/Booking');
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      serverSelectionTimeoutMS: 20000
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

// Define Consultant Schema inline
const consultantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  specialty: String,
  bio: String,
  hourlyRate: Number,
  availability: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  unavailableDates: [
    {
      date: Date,
      description: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Consultant = mongoose.model('Consultant', consultantSchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const consultants = await Consultant.find({}).lean();
      res.status(200).json({ success: true, data: consultants });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

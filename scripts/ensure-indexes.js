const mongoose = require('mongoose');
const path = require('path');

(async () => {
  try {
    const root = path.resolve(__dirname, '..');
    process.chdir(root);

    const Lead = require('../backend/models/Lead');
    const Booking = require('../backend/models/Booking');

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const leadRes = await Lead.createIndexes();
    console.log('Lead indexes ensured:', leadRes);

    const bookingRes = await Booking.createIndexes();
    console.log('Booking indexes ensured:', bookingRes);

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error ensuring indexes:', err);
    process.exit(1);
  }
})();

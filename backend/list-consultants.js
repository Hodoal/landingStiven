const Consultant = require('./models/Consultant');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  try {
    const consultants = await Consultant.find().limit(3);
    console.log('Total consultants:', consultants.length);
    consultants.forEach(c => {
      console.log(`- ${c._id} | ${c.name}`);
    });
  } catch(err) {
    console.error('Error:', err);
  }
  process.exit(0);
});

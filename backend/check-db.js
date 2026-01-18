const Consultant = require('./models/Consultant');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  const count = await Consultant.countDocuments();
  console.log('Consultants in DB:', count);
  if(count > 0) {
    const first = await Consultant.findOne();
    console.log('First:', first._id, first.name);
  }
  process.exit(0);
}).catch(err => { 
  console.log('Error:', err.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const Consultant = require('./models/Consultant');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  const all = await Consultant.find();
  console.log('Total consultants:', all.length);
  if(all.length > 0) {
    console.log('First:', all[0]._id, '|', all[0].name);
  }
  process.exit(0);
});

const availabilityService = require('./services/availabilityService');
const Consultant = require('./models/Consultant');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  try {
    // Test consultant
    const c = await Consultant.findById('696b8ebc913d971bb2dbb88a');
    console.log('Consultant found:', !!c);
    console.log('Name:', c?.name);
    console.log('IsActive:', c?.isActive);
    
    // Test getAvailableTimesForDay
    console.log('\nTesting getAvailableTimesForDay:');
    const times = await availabilityService.getAvailableTimesForDay(
      '696b8ebc913d971bb2dbb88a',
      '2026-01-17',
      60
    );
    console.log('Result count:', times.length);
    if(times.length > 0) {
      console.log('Times:', times.map(t => t.startTime));
    }
  } catch(err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
});

const Consultant = require('./models/Consultant');
const mongoose = require('mongoose');
const availabilityService = require('./services/availabilityService');
const { ObjectId } = require('mongodb');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  try {
    const id = new ObjectId('696b8ebc913d971bb2dbb88a');
    const consultant = await Consultant.findById(id);
    console.log('\n=== CONSULTANT DEBUG ===');
    console.log('Found:', !!consultant);
    console.log('IsActive:', consultant?.isActive);
    
    const dayOfWeek = new Date(2026, 0, 19).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    console.log('\nDate: 2026-01-19');
    console.log('Day of week number:', dayOfWeek, '(0=Sun, 1=Mon)');
    console.log('Day name:', dayNames[dayOfWeek]);
    
    const availabilityForDay = consultant.availability.get(dayNames[dayOfWeek]);
    console.log('\nAvailability slots for that day:', availabilityForDay);
    
    // Test the service
    console.log('\n=== SERVICE TEST ===');
    const availableTimes = await availabilityService.getAvailableTimesForDay(
      id,
      '2026-01-19',
      60
    );
    
    console.log('Available times returned:', availableTimes);
    console.log('Total:', availableTimes.length);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
});

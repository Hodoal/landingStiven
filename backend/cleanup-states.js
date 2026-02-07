/**
 * Database Cleanup Script - Standardize Client States
 * 
 * This script cleans up old/legacy client states in the database and 
 * migrates them to the new standardized state system.
 * 
 * Standardized States:
 * - 'applied': Lead is in the application phase
 * - 'scheduled': Meeting is scheduled
 * - 'meeting-completed': Meeting has been completed
 * - 'sold': Client has been converted and paid
 * - 'No califica': Lead doesn't meet requirements
 * 
 * Usage: node cleanup-states.js
 */

const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Booking = require('./models/Booking');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/stivenads';

const VALID_LEAD_STATES = ['applied', 'scheduled', 'meeting-completed', 'sold', 'No califica'];
const VALID_BOOKING_STATES = ['pending', 'confirmed', 'meeting-completed', 'sold', 'cancelled', 'No Confirmado'];

// Map old states to new states
const stateMapping = {
  // Lead states
  'lead-applied': 'applied',
  'lead-scheduled': 'scheduled',
  'lead-completed': 'meeting-completed',
  'lead-sold': 'sold',
  'new': 'applied',
  'contacted': 'applied',
  'qualified': 'applied',
  'meeting-scheduled': 'scheduled',
  'completed': 'meeting-completed',
  'converted': 'sold',
  'qualified-lead': 'applied',
  '': 'applied', // Empty strings default to applied
};

// Booking state mapping
const bookingStateMapping = {
  'scheduled': 'confirmed',
  'pending-confirmation': 'confirmed',
  'confirmed-meeting': 'confirmed',
  'reunion-completada': 'meeting-completed',
  'meeting-completed': 'meeting-completed',
  'no-show': 'cancelled',
  'rescheduled': 'confirmed',
  '': 'pending', // Empty strings default to pending
};

async function cleanupStates() {
  try {
    console.log('🔧 Starting database cleanup...\n');
    
    // Connect to MongoDB
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // =========================
    // CLEANUP LEADS
    // =========================
    console.log('📋 Cleaning up Lead states...');
    
    const leads = await Lead.find({});
    let leadsUpdated = 0;
    let leadsWithInvalidState = 0;

    for (const lead of leads) {
      let needsUpdate = false;
      let newState = lead.status;

      // Check if state is valid
      if (!VALID_LEAD_STATES.includes(lead.status)) {
        console.log(`  ❌ Invalid state for lead "${lead.full_name}": "${lead.status}"`);
        
        // Try to map old state to new state
        if (stateMapping[lead.status]) {
          newState = stateMapping[lead.status];
          console.log(`    → Mapping to: "${newState}"`);
          needsUpdate = true;
        } else {
          // Default to 'applied' if can't map
          newState = 'applied';
          console.log(`    → Defaulting to: "applied"`);
          needsUpdate = true;
        }
        leadsWithInvalidState++;
      }

      // Check for null or undefined status
      if (lead.status === null || lead.status === undefined) {
        newState = 'applied';
        needsUpdate = true;
        console.log(`  ⚠️  Null/undefined status for lead "${lead.full_name}" → defaulting to "applied"`);
        leadsWithInvalidState++;
      }

      if (needsUpdate) {
        lead.status = newState;
        await lead.save();
        leadsUpdated++;
      }
    }

    console.log(`  ✅ Leads cleaned: ${leadsUpdated} updated, ${leadsWithInvalidState} had invalid states\n`);

    // =========================
    // CLEANUP BOOKINGS
    // =========================
    console.log('📋 Cleaning up Booking states...');
    
    const bookings = await Booking.find({});
    let bookingsUpdated = 0;
    let bookingsWithInvalidState = 0;

    for (const booking of bookings) {
      let needsUpdate = false;
      let newState = booking.status;

      // Check if state is valid
      if (!VALID_BOOKING_STATES.includes(booking.status)) {
        console.log(`  ❌ Invalid state for booking "${booking.clientName}": "${booking.status}"`);
        
        // Try to map old state to new state
        if (bookingStateMapping[booking.status]) {
          newState = bookingStateMapping[booking.status];
          console.log(`    → Mapping to: "${newState}"`);
          needsUpdate = true;
        } else {
          // Default to 'pending' if can't map
          newState = 'pending';
          console.log(`    → Defaulting to: "pending"`);
          needsUpdate = true;
        }
        bookingsWithInvalidState++;
      }

      // Check for null or undefined status
      if (booking.status === null || booking.status === undefined) {
        newState = 'pending';
        needsUpdate = true;
        console.log(`  ⚠️  Null/undefined status for booking "${booking.clientName}" → defaulting to "pending"`);
        bookingsWithInvalidState++;
      }

      if (needsUpdate) {
        booking.status = newState;
        await booking.save();
        bookingsUpdated++;
      }
    }

    console.log(`  ✅ Bookings cleaned: ${bookingsUpdated} updated, ${bookingsWithInvalidState} had invalid states\n`);

    // =========================
    // GENERATE SUMMARY
    // =========================
    console.log('📊 Summary:');
    console.log(`  • Total Leads: ${leads.length}`);
    console.log(`  • Leads Updated: ${leadsUpdated}`);
    console.log(`  • Total Bookings: ${bookings.length}`);
    console.log(`  • Bookings Updated: ${bookingsUpdated}`);
    console.log(`  • Total Records Updated: ${leadsUpdated + bookingsUpdated}`);

    // Show state distribution
    console.log('\n📈 State Distribution After Cleanup:');
    
    const leadStates = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('  Lead States:');
    leadStates.forEach(item => {
      console.log(`    - ${item._id}: ${item.count}`);
    });

    const bookingStates = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('  Booking States:');
    bookingStates.forEach(item => {
      console.log(`    - ${item._id}: ${item.count}`);
    });

    console.log('\n✅ Database cleanup completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupStates();

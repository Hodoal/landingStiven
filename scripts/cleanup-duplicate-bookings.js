#!/usr/bin/env node
/**
 * Script para limpiar duplicados de bookings basados en email, fecha y hora
 * Mantiene el booking más reciente y elimina los anteriores
 * Uso: node scripts/cleanup-duplicate-bookings.js
 */

require('dotenv').config({ path: '/home/ubuntu/landingStiven/backend/.env' });
const mongoose = require('mongoose');
const Booking = require('../backend/models/Booking');

async function cleanupDuplicateBookings() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads-production';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Find all bookings grouped by email, date, and time
    const duplicates = await Booking.aggregate([
      {
        $group: {
          _id: { email: '$email', date: '$date', time: '$time' },
          count: { $sum: 1 },
          bookings: { 
            $push: {
              id: '$_id',
              clientName: '$clientName',
              status: '$status',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt'
            }
          }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`\n📋 Found ${duplicates.length} groups of duplicate bookings`);

    if (duplicates.length === 0) {
      console.log('✓ No duplicates found');
      process.exit(0);
    }

    let totalDeleted = 0;
    let totalKept = 0;

    for (const duplicate of duplicates) {
      const { email, date, time } = duplicate._id;
      const bookings = duplicate.bookings;
      
      console.log(`\n📧 Processing duplicates for ${email} on ${date} at ${time}:`);
      console.log(`   Found ${bookings.length} bookings:`);
      
      // Show all bookings for this combination
      bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ID: ${booking.id} | Status: ${booking.status} | Created: ${booking.createdAt} | Updated: ${booking.updatedAt}`);
      });

      // Sort by priority: confirmed > scheduled > others, then by most recent updatedAt
      const sortedBookings = bookings.sort((a, b) => {
        // Priority order: confirmed > scheduled > others
        const statusPriority = {
          'confirmed': 3,
          'scheduled': 2,
          'pending': 1,
          'No Confirmado': 1
        };
        
        const aPriority = statusPriority[a.status] || 0;
        const bPriority = statusPriority[b.status] || 0;
        
        // First sort by status priority
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        // Then by most recent updatedAt (or createdAt if updatedAt is same)
        const aDate = new Date(a.updatedAt || a.createdAt);
        const bDate = new Date(b.updatedAt || b.createdAt);
        return bDate - aDate; // Most recent first
      });

      // Keep the first one (highest priority/most recent)
      const toKeep = sortedBookings[0];
      const toDelete = sortedBookings.slice(1);

      console.log(`   ✅ Keeping: ${toKeep.id} (${toKeep.status})`);
      console.log(`   ❌ Deleting ${toDelete.length} duplicates:`);
      
      // Delete the duplicates
      for (const booking of toDelete) {
        await Booking.findByIdAndDelete(booking.id);
        console.log(`      - Deleted: ${booking.id} (${booking.status})`);
        totalDeleted++;
      }
      
      totalKept++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Bookings kept: ${totalKept}`);
    console.log(`   ❌ Duplicates deleted: ${totalDeleted}`);

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateBookings();
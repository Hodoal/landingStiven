#!/usr/bin/env node
/**
 * Script para limpiar duplicados de bookings y crear índices únicos
 * Uso: node scripts/fix-duplicate-bookings.js
 */

require('dotenv').config({ path: '/home/ubuntu/landingStiven/backend/.env' });
const mongoose = require('mongoose');
const Booking = require('../backend/models/Booking');

async function fixDuplicateBookings() {
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
          ids: { $push: '$_id' },
          createdDates: { $push: '$createdAt' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`\n📋 Found ${duplicates.length} duplicate bookings`);

    if (duplicates.length === 0) {
      console.log('✓ No duplicates found');
    } else {
      let deletedCount = 0;

      for (const duplicate of duplicates) {
        console.log(`\n🔍 Duplicate: ${duplicate._id.email} at ${duplicate._id.date} ${duplicate._id.time}`);
        console.log(`   Count: ${duplicate.count}, IDs: ${duplicate.ids.map(id => id.toString()).join(', ')}`);

        // Keep the oldest one, delete the rest
        const oldestId = duplicate.ids[0]; // Assuming MongoDB returns them in insertion order
        const idsToDelete = duplicate.ids.slice(1);

        console.log(`   Keeping: ${oldestId.toString()}`);
        console.log(`   Deleting: ${idsToDelete.map(id => id.toString()).join(', ')}`);

        // Delete duplicates
        const deleteResult = await Booking.deleteMany({ _id: { $in: idsToDelete } });
        deletedCount += deleteResult.deletedCount;

        console.log(`   ✓ Deleted ${deleteResult.deletedCount} duplicate(s)`);
      }

      console.log(`\n✓ Total duplicates deleted: ${deletedCount}`);
    }

    // Now create the unique index
    console.log('\n📌 Creating unique index on (email, date, time)...');
    try {
      await Booking.collection.createIndex(
        { email: 1, date: 1, time: 1 },
        { unique: true, sparse: true }
      );
      console.log('✓ Unique index created successfully');
    } catch (error) {
      if (error.code === 11000) {
        console.log('⚠️  Index already exists');
      } else {
        throw error;
      }
    }

    // Verify the index
    const indexes = await Booking.collection.getIndexes();
    console.log('\n📊 Current indexes:');
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`   - ${name}:`, JSON.stringify(spec.key || spec));
    });

    console.log('\n✅ Process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDuplicateBookings();

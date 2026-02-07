#!/usr/bin/env node
/**
 * Script para limpiar leads duplicados basados en email
 * Mantiene el lead más reciente y elimina los anteriores
 * También limpia bookings huérfanos
 */

require('dotenv').config({ path: '/home/ubuntu/landingStiven/backend/.env' });
const mongoose = require('mongoose');
const Lead = require('../backend/models/Lead');
const Booking = require('../backend/models/Booking');

async function cleanupDuplicateLeads() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads-production';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Find all leads grouped by email
    const duplicates = await Lead.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          leads: { 
            $push: {
              id: '$_id',
              full_name: '$full_name',
              status: '$status',
              lead_type: '$lead_type',
              scheduled_date: '$scheduled_date',
              scheduled_time: '$scheduled_time',
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

    console.log(`\n📋 Found ${duplicates.length} emails with duplicate leads`);

    if (duplicates.length === 0) {
      console.log('✓ No duplicate leads found');
    } else {
      let totalDeleted = 0;
      let totalKept = 0;

      for (const duplicate of duplicates) {
        const email = duplicate._id;
        const leads = duplicate.leads;
        
        console.log(`\n📧 Processing duplicates for ${email}:`);
        console.log(`   Found ${leads.length} leads:`);
        
        // Show all leads for this email
        leads.forEach((lead, index) => {
          const schedule = lead.scheduled_date && lead.scheduled_time 
            ? `${lead.scheduled_date} ${lead.scheduled_time}` 
            : 'No agendado';
          console.log(`   ${index + 1}. ${lead.full_name} | ${lead.status} | ${lead.lead_type} | ${schedule} | ${lead.createdAt}`);
        });

        // Sort by priority: with schedule > without schedule, then by most recent
        const sortedLeads = leads.sort((a, b) => {
          // Priority: leads with schedule first
          const aHasSchedule = a.scheduled_date && a.scheduled_time ? 1 : 0;
          const bHasSchedule = b.scheduled_date && b.scheduled_time ? 1 : 0;
          
          if (aHasSchedule !== bHasSchedule) {
            return bHasSchedule - aHasSchedule; // Scheduled leads first
          }
          
          // Then by most recent updatedAt/createdAt
          const aDate = new Date(a.updatedAt || a.createdAt);
          const bDate = new Date(b.updatedAt || b.createdAt);
          return bDate - aDate; // Most recent first
        });

        // Keep the first one (highest priority)
        const toKeep = sortedLeads[0];
        const toDelete = sortedLeads.slice(1);

        console.log(`   ✅ Keeping: ${toKeep.full_name} (${toKeep.status})`);
        console.log(`   ❌ Deleting ${toDelete.length} duplicates:`);
        
        // Delete the duplicates
        for (const lead of toDelete) {
          await Lead.findByIdAndDelete(lead.id);
          console.log(`      - Deleted: ${lead.full_name} (${lead.status})`);
          totalDeleted++;
        }
        
        totalKept++;
      }

      console.log(`\n📊 Lead Cleanup Summary:`);
      console.log(`   ✅ Leads kept: ${totalKept}`);
      console.log(`   ❌ Duplicate leads deleted: ${totalDeleted}`);
    }

    // Now clean up orphaned bookings (bookings without corresponding leads for test emails)
    console.log(`\n🧹 Cleaning up test bookings...`);
    
    const testEmails = [
      'test.noduplicate@example.com',
      'different.email@example.com', 
      'test.production@example.com',
      'test.produccion@example.com',
      'final.test@produccion.com'
    ];
    
    let testBookingsDeleted = 0;
    for (const email of testEmails) {
      const deleted = await Booking.deleteMany({ email: email });
      if (deleted.deletedCount > 0) {
        console.log(`   🗑️  Deleted ${deleted.deletedCount} test bookings for ${email}`);
        testBookingsDeleted += deleted.deletedCount;
      }
    }
    
    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Leads kept: ${totalKept}`);
    console.log(`   ❌ Duplicate leads deleted: ${totalDeleted}`);
    console.log(`   🗑️  Test bookings deleted: ${testBookingsDeleted}`);

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateLeads();
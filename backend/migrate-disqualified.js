/**
 * Script to migrate leads with status 'disqualified' to 'No califica'
 */

const mongoose = require('mongoose');
const Lead = require('./models/Lead');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/stivenads';

async function migrateDisqualified() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await mongoose.connect(DB_URL);
    console.log('✓ Conectado a MongoDB');

    // Find leads with 'disqualified' status
    const disqualifiedLeads = await Lead.find({ status: 'disqualified' });
    console.log(`\n📊 Leads con status 'disqualified': ${disqualifiedLeads.length}`);

    if (disqualifiedLeads.length > 0) {
      // Update status from 'disqualified' to 'No califica'
      const result = await Lead.updateMany(
        { status: 'disqualified' },
        { $set: { status: 'No califica' } }
      );

      console.log(`✅ Se actualizaron ${result.modifiedCount} leads`);
      
      // Verify migration
      const migratedLeads = await Lead.find({ status: 'No califica' });
      console.log(`\n📊 Leads con status 'No califica' después de migración: ${migratedLeads.length}`);
      
      if (migratedLeads.length > 0) {
        console.log('\n📋 Ejemplo de leads migrados:');
        migratedLeads.slice(0, 3).forEach((lead, idx) => {
          console.log(`  ${idx + 1}. ${lead.email} - ${lead.disqualified_reason || 'Sin razón'}`);
        });
      }
    } else {
      console.log('✓ No hay leads con status "disqualified" para migrar');
    }

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrateDisqualified();

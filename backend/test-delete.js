const mongoose = require('mongoose');
const Lead = require('./models/Lead');
require('dotenv').config();

async function testDelete() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    console.log('✅ Conectado\n');

    // Contar leads
    const leadsCount = await Lead.countDocuments();
    console.log(`📊 Total de leads: ${leadsCount}\n`);

    if (leadsCount === 0) {
      console.log('✅ Base de datos vacía');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Obtener el primer lead
    const firstLead = await Lead.findOne();
    console.log(`📋 Primer lead encontrado:`);
    console.log(`   - ID: ${firstLead._id}`);
    console.log(`   - Nombre: ${firstLead.full_name}`);
    console.log(`   - Email: ${firstLead.email}\n`);

    // Intentar eliminarlo
    console.log(`🗑️  Eliminando lead con ID: ${firstLead._id}`);
    const result = await Lead.findByIdAndDelete(firstLead._id);

    if (result) {
      console.log(`✓ Lead eliminado: ${result.full_name}`);
    } else {
      console.log(`❌ No se pudo eliminar el lead`);
    }

    // Verificar
    const leadsAfter = await Lead.countDocuments();
    console.log(`\n📊 Leads después: ${leadsAfter}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testDelete();

const mongoose = require('mongoose');
const Lead = require('./models/Lead');
require('dotenv').config();

async function testDelete() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    console.log('✅ Conectado\n');

    // Obtener todos los leads
    const leads = await Lead.find();
    console.log(`📊 Total leads en BD: ${leads.length}`);
    
    if (leads.length === 0) {
      console.log('❌ No hay leads para probar');
      await mongoose.connection.close();
      process.exit(0);
    }

    const lead = leads[0];
    console.log('\n📋 Lead encontrado:', lead.full_name, lead._id);
    console.log('📧 Email:', lead.email);

    // Intentar eliminar
    console.log('\n🗑️  Eliminando lead...');
    const deleted = await Lead.findByIdAndDelete(lead._id);
    console.log('✓ Resultado del delete:', deleted ? `${deleted.full_name} (${deleted._id})` : 'null');

    // Verificar que se eliminó
    const leadAfter = await Lead.findById(lead._id);
    if (leadAfter) {
      console.error('❌ ERROR: Lead aún existe!');
    } else {
      console.log('✓ Confirmado: Lead fue eliminado de la BD');
    }

    // Contar leads restantes
    const count = await Lead.countDocuments();
    console.log(`\n📊 Leads restantes después: ${count}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testDelete();

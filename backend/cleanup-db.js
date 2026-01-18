const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Booking = require('./models/Booking');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads');
    console.log('✅ Conectado a MongoDB\n');

    // Contar documentos antes
    const leadsCount = await Lead.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    console.log('📊 Documentos antes de limpiar:');
    console.log(`   - Leads: ${leadsCount}`);
    console.log(`   - Bookings: ${bookingsCount}\n`);

    // Preguntar confirmación
    if (leadsCount === 0 && bookingsCount === 0) {
      console.log('✅ Base de datos ya está vacía\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Eliminar todos los documentos
    console.log('🗑️  Eliminando documentos...');
    
    await Lead.deleteMany({});
    console.log('✅ Todos los Leads eliminados');
    
    await Booking.deleteMany({});
    console.log('✅ Todos los Bookings eliminados\n');

    // Verificar que está vacía
    const leadsCountAfter = await Lead.countDocuments();
    const bookingsCountAfter = await Booking.countDocuments();
    console.log('📊 Documentos después de limpiar:');
    console.log(`   - Leads: ${leadsCountAfter}`);
    console.log(`   - Bookings: ${bookingsCountAfter}\n`);

    console.log('✅ Base de datos vaciada exitosamente\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al limpiar la base de datos:', err.message);
    process.exit(1);
  }
}

cleanupDatabase();

// Limpiar BD y luego hacer test de eliminación

const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Booking = require('./models/Booking');

async function cleanAndTest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/stivenads', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🧹 LIMPIANDO BASE DE DATOS...\n');
    
    // Eliminar todos los leads
    const delLeads = await Lead.deleteMany({});
    console.log('✓ Leads eliminados:', delLeads.deletedCount);
    
    // Eliminar todos los bookings
    const delBookings = await Booking.deleteMany({});
    console.log('✓ Bookings eliminados:', delBookings.deletedCount);
    
    // Contar lo que quedó
    const leadsLeft = await Lead.countDocuments();
    const bookingsLeft = await Booking.countDocuments();
    
    console.log('\n✅ BD limpia:');
    console.log('   Leads restantes:', leadsLeft);
    console.log('   Bookings restantes:', bookingsLeft);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

cleanAndTest();

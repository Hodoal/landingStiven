const mongoose = require('mongoose');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/landingStiven';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Definir el modelo Booking
const bookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.model('Booking', bookingSchema);

async function cleanupNullBookings() {
  try {
    console.log('🧹 Limpiando bookings con fecha/hora nula...');
    
    // Encontrar bookings con fecha o tiempo nulos
    const nullBookings = await Booking.find({
      $or: [
        { date: null },
        { date: '' },
        { date: { $exists: false } },
        { time: null },
        { time: '' },
        { time: { $exists: false } }
      ]
    });
    
    console.log(`Found ${nullBookings.length} bookings with null/empty date or time:`);
    
    for (const booking of nullBookings) {
      console.log(`- ID: ${booking._id}, Name: ${booking.clientName}, Date: ${booking.date}, Time: ${booking.time}, Status: ${booking.status}`);
    }
    
    if (nullBookings.length > 0) {
      console.log('\n¿Deseas eliminar estos bookings? (Sí/No)');
      // Para testing, los elimino automáticamente
      
      const result = await Booking.deleteMany({
        $or: [
          { date: null },
          { date: '' },
          { date: { $exists: false } },
          { time: null },
          { time: '' },
          { time: { $exists: false } }
        ]
      });
      
      console.log(`✅ Eliminados ${result.deletedCount} bookings con fecha/hora nula`);
    } else {
      console.log('✅ No se encontraron bookings con fecha/hora nula');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

cleanupNullBookings();

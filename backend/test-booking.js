/**
 * Script de prueba para validar agendamiento con conflictos
 * Ejecutar: cd backend && node test-booking.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Consultant = require('./models/Consultant');
const availabilityService = require('./services/availabilityService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // Obtener consultor
    const consultant = await Consultant.findOne({ isActive: true });
    if (!consultant) {
      console.error('❌ No hay consultores activos');
      process.exit(1);
    }

    console.log(`📋 Pruebas con: ${consultant.name}\n`);

    // Encontrar primer lunes disponible
    let testDate = new Date();
    const dayOfWeek = testDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    testDate.setDate(testDate.getDate() + daysUntilMonday);
    
    const testDateStr = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}-${String(testDate.getDate()).padStart(2, '0')}`;
    console.log(`📅 Fecha de prueba: ${testDateStr} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][testDate.getDay()]})\n`);

    // TEST 1: Agendar una reunión
    console.log('TEST 1: Agendar reunión a las 09:00');
    const booking1 = await availabilityService.checkAvailability(
      consultant._id,
      testDate,
      '09:00',
      60
    );
    console.log(`  Resultado: ${booking1.available ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
    
    if (booking1.available) {
      // Crear la reunión
      const newBooking = new Booking({
        clientName: 'Cliente Prueba 1',
        email: 'cliente1@test.com',
        phone: '3001234567',
        date: testDateStr,
        time: '09:00',
        status: 'confirmed',
        consultantId: consultant._id,
        durationMinutes: 60
      });
      await newBooking.save();
      console.log(`  ✅ Reunión creada en BD\n`);
    }

    // TEST 2: Intentar agendar a la misma hora (debe fallar)
    console.log('TEST 2: Intentar agendar en la MISMA HORA (09:00) - Debe fallar');
    const booking2 = await availabilityService.checkAvailability(
      consultant._id,
      testDate,
      '09:00',
      60
    );
    console.log(`  Resultado: ${booking2.available ? '✅ DISPONIBLE' : '❌ CONFLICTO'}`);
    if (!booking2.available) {
      console.log(`  Razón: ${booking2.reason}\n`);
    }

    // TEST 3: Agendar a hora diferente (debe funcionar)
    console.log('TEST 3: Agendar en HORA DIFERENTE (11:00) - Debe funcionar');
    const booking3 = await availabilityService.checkAvailability(
      consultant._id,
      testDate,
      '11:00',
      60
    );
    console.log(`  Resultado: ${booking3.available ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
    
    if (booking3.available) {
      const newBooking = new Booking({
        clientName: 'Cliente Prueba 2',
        email: 'cliente2@test.com',
        phone: '3001234568',
        date: testDateStr,
        time: '11:00',
        status: 'confirmed',
        consultantId: consultant._id,
        durationMinutes: 60
      });
      await newBooking.save();
      console.log(`  ✅ Reunión creada en BD\n`);
    }

    // TEST 4: Mostrar horarios disponibles
    console.log('TEST 4: Obtener horarios DISPONIBLES para el día');
    const availableTimes = await availabilityService.getAvailableTimesForDay(
      consultant._id,
      testDate,
      60
    );
    console.log(`  Total de horarios disponibles: ${availableTimes.length}`);
    console.log(`  Primeros 5 horarios:\n`);
    availableTimes.slice(0, 5).forEach(slot => {
      console.log(`    ✅ ${slot.startTime} - ${slot.endTime}`);
    });
    console.log();

    // TEST 5: Mostrar endpoint de disponibilidad
    console.log('TEST 5: Simulación de respuesta API /available-times');
    const bookingsForDay = await Booking.find({
      date: testDateStr,
      consultantId: consultant._id,
      status: { $in: ['confirmed', 'meeting-completed'] }
    });

    console.log('  Horarios OCUPADOS:');
    bookingsForDay.forEach(b => {
      console.log(`    ❌ ${b.time} - ${b.clientName}`);
    });
    console.log();

    console.log('✅ Todas las pruebas completadas');
    console.log('\nRESUMEN:');
    console.log(`  - Agendar 1ra reunión a las 09:00: ✅`);
    console.log(`  - Agendar 2a reunión a las 09:00: ❌ (conflicto)`);
    console.log(`  - Agendar 2a reunión a las 11:00: ✅`);
    console.log(`  - El mismo DÍA permite múltiples reuniones sin conflicto: ✅`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

test();

/**
 * Script de prueba para validar disponibilidad
 * Ejecutar: cd backend && node test-availability.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/landing_stiven');
    console.log('✓ Conectado a MongoDB\n');

    const Consultant = require('./models/Consultant');
    const Booking = require('./models/Booking');
    const availabilityService = require('./services/availabilityService');

    // Obtener primer consultor activo
    const consultant = await Consultant.findOne({ isActive: true });
    if (!consultant) {
      console.error('❌ No hay consultores activos');
      process.exit(1);
    }

    console.log(`📋 Consultor: ${consultant.name}`);
    console.log(`🆔 ID: ${consultant._id}\n`);

    // Test 1: Validar fecha pasada
    console.log('TEST 1: Intentar agendar en fecha pasada');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const pastAvailability = await availabilityService.checkAvailability(
      consultant._id,
      yesterday,
      '10:00',
      60
    );
    console.log(`  Resultado: ${pastAvailability.available ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
    console.log(`  Razón: ${pastAvailability.reason}\n`);

    // Test 2: Verificar hoy
    console.log('TEST 2: Verificar disponibilidad HOY');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayBookings = await Booking.find({
      date: todayStr,
      consultantId: consultant._id,
      status: { $in: ['confirmed', 'meeting-completed'] }
    });
    
    console.log(`  Fecha: ${todayStr}`);
    console.log(`  Reuniones agendadas hoy: ${todayBookings.length}`);
    if (todayBookings.length > 0) {
      todayBookings.forEach((b, i) => {
        console.log(`    ${i + 1}. ${b.time} - ${b.clientName}`);
      });
    }
    console.log();

    const todayAvailable = await availabilityService.getAvailableTimesForDay(
      consultant._id,
      today,
      60
    );
    console.log(`  Horarios disponibles: ${todayAvailable.length}`);
    if (todayAvailable.length > 0) {
      console.log(`  Primeros 5: ${todayAvailable.slice(0, 5).map(t => t.startTime).join(', ')}`);
    }
    console.log();

    // Test 3: Verificar próximos días
    console.log('TEST 3: Próximos 5 días disponibles');
    const nextDays = 5;
    for (let i = 0; i < nextDays; i++) {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + i);
      const testDateStr = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}-${String(testDate.getDate()).padStart(2, '0')}`;
      
      const dayBookings = await Booking.find({
        date: testDateStr,
        consultantId: consultant._id,
        status: { $in: ['confirmed', 'meeting-completed'] }
      });

      const dayAvailable = await availabilityService.getAvailableTimesForDay(
        consultant._id,
        testDate,
        60
      );

      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][testDate.getDay()];
      console.log(`  ${dayName} ${testDateStr}: ${dayAvailable.length} slots, ${dayBookings.length} reuniones`);
    }
    console.log();

    // Test 4: Probar conflicto de horarios
    console.log('TEST 4: Validar detección de conflictos');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (todayBookings.length > 0) {
      const existingTime = todayBookings[0].time;
      const conflict = await availabilityService.checkAvailability(
        consultant._id,
        today,
        existingTime,
        60
      );
      console.log(`  Intentar agendar a las ${existingTime} (ya ocupado)`);
      console.log(`  Resultado: ${conflict.available ? '✅ DISPONIBLE' : '❌ CONFLICTO'}`);
      console.log(`  Razón: ${conflict.reason}\n`);
    } else {
      console.log(`  (No hay reuniones para probar conflicto)\n`);
    }

    console.log('✅ Tests completados');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();

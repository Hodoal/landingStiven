const mongoose = require('mongoose');
const Consultant = require('./backend/models/Consultant');
const Booking = require('./backend/models/Booking');
const availabilityService = require('./backend/services/availabilityService');

mongoose.connect('mongodb://localhost:27017/stivenads').then(async () => {
  try {
    console.log('\n===== 🔍 DEBUG FILTRO DE HORARIOS =====\n');

    // Obtener primer consultor activo
    const consultant = await Consultant.findOne({ isActive: true });
    if (!consultant) {
      console.log('❌ No hay consultores activos');
      process.exit(1);
    }

    console.log('✅ Consultor:', consultant.name, `(${consultant._id})`);
    console.log('Disponibilidad configurada:', consultant.availability);

    // Usar una fecha de prueba (hoy o mañana)
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Mañana
    const dateStr = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}-${String(testDate.getDate()).padStart(2, '0')}`;
    
    console.log(`\n📅 Fecha de prueba: ${dateStr}`);

    // Obtener reservas existentes para esa fecha
    const existingBookings = await Booking.find({
      $or: [
        { assignedConsultant: consultant._id },
        { consultantId: consultant._id }
      ],
      date: dateStr,
      status: { $in: ['confirmed', 'meeting-completed'] }
    });

    console.log(`\n📊 Reservas existentes para ${dateStr}:`);
    if (existingBookings.length === 0) {
      console.log('  ✅ No hay reservas');
    } else {
      existingBookings.forEach(b => {
        console.log(`  ❌ ${b.time} - ${b.clientName} (${b.status})`);
      });
    }

    // Llamar al servicio de disponibilidad
    console.log(`\n🔄 Llamando a availabilityService.getAvailableTimesForDay...`);
    const availableTimes = await availabilityService.getAvailableTimesForDay(
      consultant._id,
      dateStr,
      60
    );

    console.log(`\n✅ Horarios disponibles retornados: ${availableTimes.length}`);
    if (availableTimes.length > 0) {
      console.log('Primeros 5:');
      availableTimes.slice(0, 5).forEach(t => {
        console.log(`  • ${t.startTime} - ${t.endTime}`);
      });
      if (availableTimes.length > 5) {
        console.log(`  ... y ${availableTimes.length - 5} más`);
      }
    }

    // Simular lo que hace consultantRoutes
    console.log(`\n📋 Simulando respuesta de consultantRoutes...`);
    
    const occupiedTimes = existingBookings.map(booking => ({
      startTime: booking.time,
      endTime: availabilityService.minutesToTime(
        availabilityService.timeToMinutes(booking.time) + (booking.durationMinutes || 60)
      ),
      durationMinutes: booking.durationMinutes || 60,
      clientName: booking.clientName || 'Cliente',
      status: booking.status
    }));

    const allSlots = [];
    const slotStartMinutes = availabilityService.timeToMinutes('08:00');
    const slotEndMinutes = availabilityService.timeToMinutes('20:00');
    
    for (let currentMinutes = slotStartMinutes; currentMinutes + 60 <= slotEndMinutes; currentMinutes += 30) {
      const currentTime = availabilityService.minutesToTime(currentMinutes);
      
      // Verificar si este slot está en la lista de disponibles
      const isInAvailableList = availableTimes.some(slot => slot.startTime === currentTime);
      
      allSlots.push({
        startTime: currentTime,
        available: isInAvailableList
      });
    }

    console.log(`Total de slots (08:00-20:00): ${allSlots.length}`);
    console.log(`Slots disponibles: ${allSlots.filter(s => s.available).length}`);
    console.log(`Slots ocupados: ${allSlots.filter(s => !s.available).length}`);

    console.log('\n📊 Vista de todos los slots:');
    allSlots.forEach(slot => {
      const status = slot.available ? '✅' : '❌';
      console.log(`  ${status} ${slot.startTime}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
});

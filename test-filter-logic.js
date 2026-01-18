/**
 * Test de la lógica de filtro de disponibilidad
 * Sin dependencias de MongoDB
 */

// Simulación de funciones de tiempo
function timeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Simulación de consultant.isTimeSlotAvailable
function isTimeSlotAvailable(dayName, availability, startTime, durationMinutes) {
  let availableSlots = availability[dayName] || [];
  
  return availableSlots.some(slot => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const requestStart = timeToMinutes(startTime);
    const requestEnd = requestStart + durationMinutes;

    // Verificar que esté dentro del slot disponible
    return requestStart >= slotStart && requestEnd <= slotEnd;
  });
}

// Simulación del servicio mejorado
function getAvailableTimesForDay(dayName, availability, existingBookings, durationMinutes = 60) {
  const slotStartMinutes = timeToMinutes('08:00');
  const slotEndMinutes = timeToMinutes('20:00');
  const availableTimes = [];

  // Generar slots de 30 minutos entre 08:00 y 20:00
  for (let currentMinutes = slotStartMinutes; currentMinutes + durationMinutes <= slotEndMinutes; currentMinutes += 30) {
    const currentTime = minutesToTime(currentMinutes);
    const endTime = minutesToTime(currentMinutes + durationMinutes);

    // 1. Verificar si está dentro de la disponibilidad configurada
    const isWithinAvailability = isTimeSlotAvailable(dayName, availability, currentTime, durationMinutes);
    
    if (!isWithinAvailability) {
      continue;
    }

    // 2. Verificar que no haya conflicto con reuniones existentes
    let hasConflict = false;
    for (const booking of existingBookings) {
      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + (booking.durationMinutes || 60);

      if (currentMinutes < bookingEnd && currentMinutes + durationMinutes > bookingStart) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      availableTimes.push({
        startTime: currentTime,
        endTime: endTime,
        available: true
      });
    }
  }

  return availableTimes;
}

// ============= TEST CASES =============
console.log('🧪 TEST DE FILTRO DE HORARIOS\n');

// Caso 1: Consultor disponible de 08:00 a 18:00 sin interrupciones
console.log('📝 Caso 1: Consultor disponible 08:00-18:00, sin reservas');
const availability1 = {
  'monday': [{ startTime: '08:00', endTime: '18:00' }],
  'tuesday': [{ startTime: '08:00', endTime: '18:00' }],
  'wednesday': [{ startTime: '08:00', endTime: '18:00' }],
  'thursday': [{ startTime: '08:00', endTime: '18:00' }],
  'friday': [{ startTime: '08:00', endTime: '18:00' }],
  'saturday': [{ startTime: '09:00', endTime: '13:00' }],
  'sunday': []
};

const slots1 = getAvailableTimesForDay('monday', availability1, [], 60);
console.log(`✅ Slots disponibles: ${slots1.length}`);
console.log(`   Primeros 3: ${slots1.slice(0, 3).map(s => s.startTime).join(', ')}`);
console.log(`   Últimos 3: ${slots1.slice(-3).map(s => s.startTime).join(', ')}`);

// Caso 2: Con reserva a las 10:00
console.log('\n📝 Caso 2: Con reserva a las 10:00-11:00');
const bookings2 = [
  { time: '10:00', durationMinutes: 60 }
];

const slots2 = getAvailableTimesForDay('monday', availability1, bookings2, 60);
console.log(`✅ Slots disponibles: ${slots2.length}`);
console.log(`   Horarios alrededor de 10:00:`);
slots1.slice(4, 9).forEach(s => {
  const isBooked = bookings2.some(b => {
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + 60;
    const sStart = timeToMinutes(s.startTime);
    const sEnd = sStart + 60;
    return sStart < bEnd && sEnd > bStart;
  });
  console.log(`     ${s.startTime}: ${isBooked ? '❌ Ocupado' : '✅ Libre'}`);
});

// Caso 3: Consultor con horario limitado
console.log('\n📝 Caso 3: Consultor disponible solo 09:00-12:00 y 14:00-17:00');
const availability3 = {
  'monday': [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  'tuesday': [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  'wednesday': [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  'thursday': [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  'friday': [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  'saturday': [],
  'sunday': []
};

const slots3 = getAvailableTimesForDay('monday', availability3, [], 60);
console.log(`✅ Slots disponibles: ${slots3.length}`);
console.log(`   ${slots3.map(s => s.startTime).join(', ')}`);

console.log('\n🎉 TESTS COMPLETADOS');

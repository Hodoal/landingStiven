function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

const slotStartMinutes = timeToMinutes('08:00'); // 480
const slotEndMinutes = timeToMinutes('20:00');   // 1200
const durationMinutes = 60;

console.log('Inicio:', slotStartMinutes, '(08:00)');
console.log('Fin:', slotEndMinutes, '(20:00)');
console.log('Duración:', durationMinutes);
console.log('\nSlots generados:');

const slots = [];
for (let currentMinutes = slotStartMinutes; currentMinutes + durationMinutes <= slotEndMinutes; currentMinutes += 30) {
  const startTime = minutesToTime(currentMinutes);
  const endTime = minutesToTime(currentMinutes + durationMinutes);
  slots.push(`${startTime} - ${endTime}`);
}

slots.forEach(s => console.log(s));
console.log('\nTotal slots:', slots.length);
console.log('Último slot válido:', slots[slots.length - 1]);

// Ahora prueba con duración de 60 y un conflicto a las 12:00
console.log('\n\n=== PRUEBA DE CONFLICTOS ===');
const bookings = [
  { time: '12:00', durationMinutes: 60 }
];

console.log('Reunión reservada: 12:00 - 13:00');
console.log('\nSlots después de filtrar conflictos:');

const availableSlots = [];
for (let currentMinutes = slotStartMinutes; currentMinutes + durationMinutes <= slotEndMinutes; currentMinutes += 30) {
  const currentTime = minutesToTime(currentMinutes);
  const endTime = minutesToTime(currentMinutes + durationMinutes);

  let hasConflict = false;
  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + (booking.durationMinutes || 60);

    if (currentMinutes < bookingEnd && currentMinutes + durationMinutes > bookingStart) {
      hasConflict = true;
      console.log(`❌ ${currentTime} - ${endTime} (CONFLICTO con 12:00-13:00)`);
      break;
    }
  }

  if (!hasConflict) {
    availableSlots.push(`${currentTime} - ${endTime}`);
  }
}

console.log('\nDisponibles:');
availableSlots.forEach(s => console.log(`✓ ${s}`));
console.log(`\nTotal disponibles: ${availableSlots.length}`);

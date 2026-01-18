/**
 * Debug para ver reuniones programadas en una fecha
 */
const mongoose = require('mongoose');
const Booking = require('./backend/models/Booking');
const Consultant = require('./backend/models/Consultant');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

mongoose.connect(mongoUri).then(async () => {
  try {
    console.log('\n===== 🔍 DEBUG REUNIONES PROGRAMADAS =====\n');

    // Obtener un consultor
    const consultant = await Consultant.findOne({ isActive: true });
    if (!consultant) {
      console.log('❌ No hay consultores activos');
      process.exit(1);
    }

    console.log(`✅ Consultor: ${consultant.name} (${consultant._id})`);

    // Usar fecha de hoy
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`\n📅 Fecha: ${dateStr}`);
    console.log(`   (Hoy: ${today.toDateString()})\n`);

    // Buscar reuniones para esta fecha
    const allBookings = await Booking.find({ date: dateStr }).sort({ time: 1 });
    console.log(`📊 TODAS las reuniones en ${dateStr}:`);
    if (allBookings.length === 0) {
      console.log('   ✅ No hay reuniones');
    } else {
      allBookings.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.time} - ${b.clientName} (Estado: ${b.status})`);
      });
    }

    // Buscar reuniones confirmadas para este consultor
    const confirmedBookings = await Booking.find({
      $or: [
        { assignedConsultant: consultant._id },
        { consultantId: consultant._id }
      ],
      date: dateStr,
      status: { $in: ['confirmed', 'meeting-completed'] }
    }).sort({ time: 1 });

    console.log(`\n🟢 Reuniones CONFIRMADAS para ${consultant.name}:`);
    if (confirmedBookings.length === 0) {
      console.log('   ✅ No hay reuniones confirmadas');
    } else {
      confirmedBookings.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.time} - ${b.clientName}`);
      });
    }

    // Mostrar disponibilidad configurada del consultor
    console.log(`\n⏰ Disponibilidad configurada del consultor:`);
    if (consultant.availability && typeof consultant.availability === 'object') {
      Object.entries(consultant.availability).forEach(([day, slots]) => {
        if (slots && slots.length > 0) {
          console.log(`   ${day}: ${slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}`);
        }
      });
    }

    // Listar todos los slots del día (08:00 a 20:00)
    console.log(`\n📋 TODOS los horarios del día (08:00-20:00):`);
    const slots = [];
    for (let i = 8; i < 20; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }

    console.log('   Horario | Ocupado? | Razón');
    console.log('   --------|----------|------');
    
    slots.forEach(slot => {
      // Verificar si hay reunión en este slot
      const hasBooking = confirmedBookings.some(b => b.time === slot);
      console.log(`   ${slot}    | ${hasBooking ? '❌ SÍ' : '✅ NO'} ${hasBooking ? '' : '     '} | ${hasBooking ? 'Reunión' : ''}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
});

const Booking = require('../models/Booking');
const Consultant = require('../models/Consultant');

/**
 * Servicio para gestionar disponibilidad de consultores
 * Valida que no haya conflictos de horarios
 */

// Convertir HH:MM a minutos desde medianoche
function timeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convertir minutos a HH:MM
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Verificar si un horario específico está disponible para un consultor
 * @param {ObjectId} consultantId - ID del consultor
 * @param {Date} date - Fecha de la reunión
 * @param {String} startTime - Hora de inicio (HH:MM)
 * @param {Number} durationMinutes - Duración en minutos (default: 60)
 * @returns {Object} { available: boolean, reason: string }
 */
async function checkAvailability(consultantId, date, startTime, durationMinutes = 60) {
  try {
    const consultant = await Consultant.findById(consultantId);
    if (!consultant || !consultant.isActive) {
      return { available: false, reason: 'Consultor no disponible' };
    }

    // Convertir date a string si es objeto Date (formato YYYY-MM-DD)
    const dateString = typeof date === 'string' 
      ? date 
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Convertir string a Date para validaciones
    const [year, month, day] = dateString.split('-').map(Number);
    // Crear Date en medianoche local para representar correctamente ese día
    const dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Validar que no sea una fecha PASADA (pero permitir HOY)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Rechazar solo si es anterior a hoy (AYER o antes)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateObj < yesterday) {
      return { available: false, reason: 'No se puede agendar en fechas pasadas' };
    }

    // 1. Verificar disponibilidad según horario establecido
    if (!consultant.isTimeSlotAvailable(dateObj, startTime, durationMinutes)) {
      return { available: false, reason: 'Horario fuera de disponibilidad' };
    }

    // 2. Verificar conflictos con reuniones existentes
    const existingBookings = await Booking.find({
      $or: [
        { assignedConsultant: consultantId },
        { consultantId: consultantId }
      ],
      date: dateString, // Buscar por fecha exacta (string)
      status: { $in: ['confirmed', 'meeting-completed'] }
    });

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;

    for (const booking of existingBookings) {
      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + (booking.durationMinutes || 60);

      // Verificar si hay conflicto
      if (startMinutes < bookingEnd && endMinutes > bookingStart) {
        return {
          available: false,
          reason: `Conflicto con reunión existente a las ${booking.time}`,
          conflictingBooking: booking._id
        };
      }
    }

    // 3. Verificar si la fecha está marcada como no disponible
    const unavailableDate = consultant.unavailableDates.find(
      d => d.toDateString() === dateObj.toDateString()
    );

    if (unavailableDate) {
      return {
        available: false,
        reason: `Consultor no disponible: ${unavailableDate.description || 'Día no disponible'}`
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, reason: 'Error al verificar disponibilidad' };
  }
}

/**
 * Obtener horarios disponibles para un día (SIN considerar disponibilidad configurada)
 * NUEVO: Solo excluye horarios ocupados por reuniones confirmadas
 * Muestra TODOS los días sin filtrar por sábado/domingo
 * @param {ObjectId} consultantId - ID del consultor
 * @param {Date|String} date - Fecha a consultar (Date o YYYY-MM-DD)
 * @param {Number} durationMinutes - Duración de la reunión
 * @returns {Object} { availableSlots, bookedSlots }
 */
async function getAvailableSlotsSimple(consultantId, date, durationMinutes = 60) {
  try {
    const consultant = await Consultant.findById(consultantId);
    if (!consultant || !consultant.isActive) {
      return { availableSlots: [], bookedSlots: [] };
    }

    // Convertir date a objeto Date si es string
    let dateObj;
    let dateString;
    
    if (typeof date === 'string') {
      dateString = date;
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dateObj = date;
    }

    // Obtener TODAS las reuniones confirmadas para ese día
    const existingBookings = await Booking.find({
      $or: [
        { assignedConsultant: consultantId },
        { consultantId: consultantId }
      ],
      date: dateString,
      status: { $in: ['confirmed', 'meeting-completed'] }
    });

    const slotStartMinutes = timeToMinutes('08:00');
    const slotEndMinutes = timeToMinutes('20:00');
    
    const availableSlots = [];
    const bookedSlots = [];

    // Generar slots de 30 minutos entre 08:00 y 20:00
    for (let currentMinutes = slotStartMinutes; currentMinutes + durationMinutes <= slotEndMinutes; currentMinutes += 30) {
      const currentTime = minutesToTime(currentMinutes);
      const endTime = minutesToTime(currentMinutes + durationMinutes);

      // Verificar si hay conflicto con reuniones existentes
      let hasConflict = false;
      let conflictingBooking = null;

      for (const booking of existingBookings) {
        const bookingStart = timeToMinutes(booking.time);
        const bookingEnd = bookingStart + (booking.durationMinutes || 60);

        if (currentMinutes < bookingEnd && currentMinutes + durationMinutes > bookingStart) {
          hasConflict = true;
          conflictingBooking = booking;
          break;
        }
      }

      if (!hasConflict) {
        availableSlots.push({
          startTime: currentTime,
          endTime: endTime,
          available: true
        });
      } else {
        bookedSlots.push({
          startTime: currentTime,
          endTime: endTime,
          available: false,
          clientName: conflictingBooking?.clientName || 'Cliente',
          bookingTime: conflictingBooking?.time || currentTime
        });
      }
    }

    return {
      availableSlots,
      bookedSlots
    };
  } catch (error) {
    console.error('Error getting available slots (simple):', error);
    return { availableSlots: [], bookedSlots: [] };
  }
}

/**
 * Obtener horarios disponibles para un día específico
 * @param {ObjectId} consultantId - ID del consultor
 * @param {Date|String} date - Fecha a consultar (Date o YYYY-MM-DD)
 * @param {Number} durationMinutes - Duración de la reunión
 * @returns {Array} Lista de horarios disponibles
 */
async function getAvailableTimesForDay(consultantId, date, durationMinutes = 60) {
  try {
    const consultant = await Consultant.findById(consultantId);
    if (!consultant || !consultant.isActive) {
      return [];
    }

    // Convertir date a objeto Date si es string
    let dateObj;
    let dateString;
    
    if (typeof date === 'string') {
      // Mantener el string exactamente como viene
      dateString = date;
      // Para obtener el día de la semana, parsear correctamente en local timezone
      const [year, month, day] = date.split('-').map(Number);
      // Crear Date en medianoche local para obtener el día correcto
      dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      // Si es un Date object, convertir a string YYYY-MM-DD
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dateObj = date;
    }

    // Obtener el día de la semana (0=Domingo, 1=Lunes, etc.)
    // IMPORTANTE: Usar getDay() en local timezone
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Verificar si la fecha está marcada como no disponible
    const unavailableDate = consultant.unavailableDates.find(
      d => d.toDateString() === dateObj.toDateString()
    );
    
    if (unavailableDate) {
      return []; // Día completamente no disponible
    }

    // Generar slots de 08:00 a 20:00 (8am a 8pm) en intervalos de 30 minutos
    const slotStartMinutes = timeToMinutes('08:00'); // 480 minutos
    const slotEndMinutes = timeToMinutes('20:00');   // 1200 minutos

    // Obtener todas las reuniones confirmadas para ese día (buscar por string de fecha)
    const existingBookings = await Booking.find({
      $or: [
        { assignedConsultant: consultantId },
        { consultantId: consultantId }
      ],
      date: dateString,
      status: { $in: ['confirmed', 'meeting-completed'] }
    });

    // Generar lista de horarios disponibles
    const availableTimes = [];

    // Generar slots de 30 minutos entre 08:00 y 20:00
    for (let currentMinutes = slotStartMinutes; currentMinutes + durationMinutes <= slotEndMinutes; currentMinutes += 30) {
      const currentTime = minutesToTime(currentMinutes);
      const endTime = minutesToTime(currentMinutes + durationMinutes);

      // 1. Verificar si está dentro de la disponibilidad configurada del consultor
      const isWithinAvailability = consultant.isTimeSlotAvailable(dateObj, currentTime, durationMinutes);
      
      if (!isWithinAvailability) {
        continue; // Este horario no está en la configuración de disponibilidad
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
  } catch (error) {
    console.error('Error getting available times:', error);
    return [];
  }
}

/**
 * Obtener próximos horarios disponibles
 * @param {ObjectId} consultantId - ID del consultor
 * @param {Date} startDate - Fecha de inicio
 * @param {Number} numberOfDays - Número de días a consultar
 * @param {Number} durationMinutes - Duración de la reunión
 * @returns {Array} Lista de horarios disponibles próximos
 */
async function getNextAvailableSlots(consultantId, startDate = new Date(), numberOfDays = 30, durationMinutes = 60) {
  try {
    const consultant = await Consultant.findById(consultantId);
    if (!consultant || !consultant.isActive) {
      return [];
    }

    const slots = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < numberOfDays; i++) {
      const availableTimes = await getAvailableTimesForDay(consultantId, currentDate, durationMinutes);

      for (const time of availableTimes) {
        slots.push({
          date: new Date(currentDate),
          startTime: time.startTime,
          endTime: time.endTime
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);

      if (slots.length >= 15) {
        break; // Obtener máximo 15 slots
      }
    }

    return slots;
  } catch (error) {
    console.error('Error getting next available slots:', error);
    return [];
  }
}

/**
 * Asignar una reunión a un consultor
 * @param {ObjectId} bookingId - ID de la reunión
 * @param {ObjectId} consultantId - ID del consultor
 * @returns {Object} { success: boolean, message: string }
 */
async function assignBookingToConsultant(bookingId, consultantId) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return { success: false, message: 'Reunión no encontrada' };
    }

    // Verificar disponibilidad
    const availability = await checkAvailability(
      consultantId,
      new Date(booking.date),
      booking.time,
      booking.durationMinutes || 60
    );

    if (!availability.available) {
      return { success: false, message: availability.reason };
    }

    // Asignar consultor
    booking.assignedConsultant = consultantId;
    booking.consultantId = consultantId;
    await booking.save();

    // Añadir booking a la lista del consultor
    await Consultant.findByIdAndUpdate(
      consultantId,
      { $push: { bookings: bookingId } },
      { new: true }
    );

    return { success: true, message: 'Reunión asignada exitosamente' };
  } catch (error) {
    console.error('Error assigning booking:', error);
    return { success: false, message: 'Error al asignar reunión' };
  }
}

/**
 * Liberar horario de una reunión
 * @param {ObjectId} bookingId - ID de la reunión
 * @returns {Object} { success: boolean }
 */
async function releaseBooking(bookingId) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.assignedConsultant) {
      return { success: false, message: 'Reunión no asignada' };
    }

    const consultantId = booking.assignedConsultant;

    // Remover booking del consultor
    await Consultant.findByIdAndUpdate(
      consultantId,
      { $pull: { bookings: bookingId } },
      { new: true }
    );

    // Desasignar del booking
    booking.assignedConsultant = null;
    booking.consultantId = null;
    await booking.save();

    return { success: true, message: 'Reunión liberada' };
  } catch (error) {
    console.error('Error releasing booking:', error);
    return { success: false, message: 'Error al liberar reunión' };
  }
}

module.exports = {
  checkAvailability,
  getAvailableTimesForDay,
  getAvailableSlotsSimple,
  getNextAvailableSlots,
  assignBookingToConsultant,
  releaseBooking,
  timeToMinutes,
  minutesToTime
};

const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  phone: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  
  // Disponibilidad por horas
  // Estructura: { dayOfWeek: [{ startTime: "09:00", endTime: "12:00", durationMinutes: 60 }] }
  availability: {
    type: Map,
    of: [
      {
        startTime: {
          type: String,
          required: true,
          match: /^([0-1]\d|2[0-3]):[0-5]\d$/ // Formato HH:MM
        },
        endTime: {
          type: String,
          required: true,
          match: /^([0-1]\d|2[0-3]):[0-5]\d$/ // Formato HH:MM
        },
        durationMinutes: {
          type: Number,
          default: 60,
          min: 15,
          max: 480 // Máximo 8 horas
        },
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6 // 0 = Domingo, 1 = Lunes, etc.
        }
      }
    ],
    default: {
      'monday': [],
      'tuesday': [],
      'wednesday': [],
      'thursday': [],
      'friday': [],
      'saturday': [],
      'sunday': []
    }
  },

  // Horario de almuerzo o descanso (opcional)
  breakTime: {
    startTime: {
      type: String,
      match: /^([0-1]\d|2[0-3]):[0-5]\d$/,
      default: '12:00'
    },
    endTime: {
      type: String,
      match: /^([0-1]\d|2[0-3]):[0-5]\d$/,
      default: '13:00'
    }
  },

  // Días festivos o no disponibles
  unavailableDates: [{
    type: Date,
    description: String
  }],

  // Reuniones agendadas (referencia a bookings)
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

  // Estado del consultor
  isActive: {
    type: Boolean,
    default: true
  },

  // Información adicional
  bio: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  googleCalendarEmail: {
    type: String,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { toJSON: { virtuals: true } });

// Virtual para ID
consultantSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Método para obtener horarios disponibles en una fecha específica
consultantSchema.methods.getAvailableSlotsForDate = function(date, durationMinutes = 60) {
  const dayOfWeek = date.getDay(); // 0-6
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  const availableSlots = this.availability.get(dayName) || [];
  
  // Filtrar slots que tengan la duración mínima requerida
  return availableSlots.filter(slot => slot.durationMinutes >= durationMinutes);
};

// Método para verificar si una hora específica está disponible
consultantSchema.methods.isTimeSlotAvailable = function(date, startTime, durationMinutes) {
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  // Manejo de Map y objetos
  let availableSlots = [];
  if (this.availability instanceof Map) {
    availableSlots = this.availability.get(dayName) || [];
  } else if (this.availability && typeof this.availability === 'object') {
    availableSlots = this.availability[dayName] || [];
  }

  return availableSlots.some(slot => {
    // Convertir tiempos a minutos para comparación
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const requestStart = timeToMinutes(startTime);
    const requestEnd = requestStart + durationMinutes;

    // Verificar que no esté en el descanso
    if (this.breakTime) {
      const breakStart = timeToMinutes(this.breakTime.startTime);
      const breakEnd = timeToMinutes(this.breakTime.endTime);
      if (requestStart < breakEnd && requestEnd > breakStart) {
        return false; // Cruza con el descanso
      }
    }

    // Verificar que esté dentro del slot disponible
    return requestStart >= slotStart && requestEnd <= slotEnd;
  });
};

// Método auxiliar para convertir HH:MM a minutos
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Método para obtener próximas slots disponibles
consultantSchema.methods.getNextAvailableSlots = function(startDate, numberOfDays = 30, durationMinutes = 60) {
  const slots = [];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + numberOfDays);

  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    // Saltar días no disponibles
    const dateString = d.toISOString().split('T')[0];
    const isUnavailable = this.unavailableDates.some(
      unavail => unavail.toISOString().split('T')[0] === dateString
    );

    if (isUnavailable) continue;

    const dayOfWeek = d.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Manejo de Map y objetos
    let availableSlots = [];
    if (this.availability instanceof Map) {
      availableSlots = this.availability.get(dayName) || [];
    } else if (this.availability && typeof this.availability === 'object') {
      availableSlots = this.availability[dayName] || [];
    }

    for (const slot of availableSlots) {
      if (slot.durationMinutes >= durationMinutes) {
        slots.push({
          date: new Date(d),
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: true
        });
      }
    }
  }

  return slots.slice(0, 10); // Retornar máximo 10 slots
};

module.exports = mongoose.model('Consultant', consultantSchema);

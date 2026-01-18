const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  meetLink: {
    type: String,
    default: null
  },
  googleCalendarEventId: {
    type: String,
    default: null
  },
  teamsLink: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'meeting-completed', 'sold', 'cancelled', 'No Confirmado'],
    default: 'pending'
  },
  // Referencia al consultor asignado
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
    default: null
  },
  // Duración de la reunión en minutos
  durationMinutes: {
    type: Number,
    default: 60,
    min: 15,
    max: 480
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String,
    unique: true,
    sparse: true
  },
  // Sales tracking fields
  venta_confirmada: {
    type: Boolean,
    default: false
  },
  monto_venta: {
    type: Number,
    default: 0
  },
  fecha_venta: {
    type: Date,
    default: null
  },
  // Metadata
  cancelledAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { toJSON: { virtuals: true } });

// Add virtual id field for compatibility
bookingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Booking', bookingSchema);

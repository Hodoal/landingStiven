const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');
const { 
  sendConfirmationEmail, 
  sendRescheduleNotification 
} = require('../services/emailService');
const { 
  createGoogleCalendarEvent,
  getAvailableSlots,
  deleteGoogleCalendarEvent
} = require('../services/calendarService');

// GET all bookings for admin panel - From MongoDB
router.get('/list', async (req, res) => {
  try {
    // Fetch all bookings from MongoDB
    let bookings = await Booking.find().sort({ createdAt: -1 });
    
    // Auto-update status for past meetings
    const now = new Date();
    for (let booking of bookings) {
      // Skip if already sold or cancelled
      if (booking.status === 'sold' || booking.status === 'cancelled') continue;
      
      // Parse date and time to check if meeting is in the past
      const [year, month, day] = booking.date.split('-').map(Number);
      const [hours, minutes] = booking.time.split(':').map(Number);
      const meetingDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // If meeting is in the past and not yet marked as completed
      if (meetingDateTime < now && booking.status !== 'meeting-completed' && !booking.venta_confirmada) {
        booking.status = 'meeting-completed';
        await booking.save();
        console.log(`✓ Auto-marked meeting as completed: ${booking.clientName} (${booking.date} ${booking.time})`);
      }
    }
    
    // Re-fetch to get updated data
    bookings = await Booking.find().sort({ createdAt: -1 });
    
    // Log bookings for debugging
    console.log('Bookings from MongoDB:', bookings.map(b => ({ id: b._id, name: b.clientName, status: b.status })));
    
    // Return bookings with id field for compatibility
    const formattedBookings = bookings.map(b => ({
      ...b.toObject({ virtuals: true }),
      id: b._id.toString()
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings,
      total: formattedBookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// GET booking by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const booking = await Booking.findOne({ email: email });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      booking: {
        ...booking.toObject({ virtuals: true }),
        id: booking._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching booking by email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// GET available times for a specific date
router.get('/available-times', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date parameter is required' 
      });
    }

    // Get available slots from Google Calendar
    const availableData = await getAvailableSlots(new Date(date));
    
    res.json({ 
      success: true, 
      date: date,
      times: availableData.availableSlots,
      totalSlots: generateTimeSlots().length,
      bookedSlots: availableData.bookedSlots
    });
  } catch (error) {
    console.error('Error fetching available times:', error);
    // Return default slots in case of error
    res.json({ 
      success: true, 
      times: generateTimeSlots(),
      totalSlots: 20,
      bookedSlots: [],
      error: error.message
    });
  }
});

// CREATE new booking - Save to MongoDB
router.post('/create', async (req, res) => {
  try {
    const { name, email, phone, company, message, date, time, consultantId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, email, phone, date, time' 
      });
    }

    // Parse date string (YYYY-MM-DD) and time string (HH:MM)
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date object (inicio del día)
    const bookingDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar que la fecha NO sea anterior a hoy
    if (bookingDate < today) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede agendar en fechas pasadas' 
      });
    }

    // Si hay consultantId, validar disponibilidad
    if (consultantId) {
      const Consultant = require('../models/Consultant');
      const availabilityService = require('../services/availabilityService');
      
      const consultant = await Consultant.findById(consultantId);
      if (!consultant || !consultant.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'Consultor no disponible' 
        });
      }

      // Validar disponibilidad
      const availability = await availabilityService.checkAvailability(
        consultantId,
        bookingDate,
        time,
        60 // duración estándar
      );

      if (!availability.available) {
        return res.status(400).json({ 
          success: false, 
          message: availability.reason || 'Horario no disponible' 
        });
      }
    }

    // Create datetime for Google Calendar
    const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    let googleCalendarResponse = null;
    let meetLink = null;
    let googleCalendarEventId = null;

    // Create event in Google Calendar
    try {
      googleCalendarResponse = await createGoogleCalendarEvent({
        title: `Asesoría de Marketing - ${name}`,
        description: `Cliente: ${name}\nTeléfono: ${phone}\nEmpresa: ${company || 'No especificada'}\nMensaje: ${message || 'Sin comentarios'}`,
        startTime: dateTime,
        attendeeEmail: email
      });
      
      meetLink = googleCalendarResponse.meetLink;
      googleCalendarEventId = googleCalendarResponse.eventId;
      console.log('✓ Google Calendar event created:', googleCalendarEventId);
      console.log('✓ Meet link:', meetLink);
    } catch (error) {
      console.error('Warning: Could not create Google Calendar event:', error.message);
      // Fallback if calendar creation fails
      meetLink = `https://meet.google.com/${uuidv4().replace(/-/g, '').substring(0, 21)}`;
    }
    
    const confirmationToken = uuidv4();
    
    // Create booking document in MongoDB
    const booking = new Booking({
      clientName: name,
      email: email,
      phone: phone,
      company: company || '',
      message: message || '',
      date: date,
      time: time,
      meetLink: meetLink,
      googleCalendarEventId: googleCalendarEventId,
      confirmationToken: confirmationToken,
      status: 'confirmed',
      consultantId: consultantId || null,
      durationMinutes: 60
    });

    // Save to MongoDB
    await booking.save();
    console.log('✓ Booking saved to MongoDB:', booking._id);

    // Send confirmation email to client
    try {
      await sendConfirmationEmail({
        to: email,
        clientName: name,
        date: date,
        time: time,
        meetLink: meetLink,
        confirmationToken: confirmationToken
      });
      
      booking.emailSent = true;
      await booking.save();
    } catch (error) {
      console.error('Error sending confirmation email to client:', error);
      booking.emailSent = false;
    }

    // Send confirmation email to owner
    try {
      const ownerEmail = process.env.EMAIL_USER;
      if (ownerEmail && ownerEmail !== 'placeholder@gmail.com') {
        await sendConfirmationEmail({
          to: ownerEmail,
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          company: company,
          message: message,
          date: date,
          time: time,
          meetLink: meetLink,
          isOwnerEmail: true
        });
      }
    } catch (error) {
      console.error('Error sending confirmation email to owner:', error);
    }

    res.json({ 
      success: true, 
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id.toString(),
        date: booking.date,
        time: booking.time,
        meetLink: booking.meetLink
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// GET booking details
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking' 
    });
  }
});

// CANCEL booking
router.post('/:bookingId/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Delete from Google Calendar
    if (booking.googleCalendarEventId) {
      try {
        await deleteGoogleCalendarEvent(booking.googleCalendarEventId);
      } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking' 
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  for (let i = 8; i < 18; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
}

// Helper function to generate Google Meet link
function generateMeetLink() {
  return `https://meet.google.com/${uuidv4().replace(/-/g, '').substring(0, 21)}`;
}

// PUT - Confirm sale for a booking - From MongoDB
router.put('/:id/confirm-sale', async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_venta } = req.body;

    console.log(`\n💰 CONFIRM SALE request for booking ID: ${id}`);
    console.log(`Sale amount: ${monto_venta}`);

    if (!monto_venta || monto_venta <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto de venta inválido'
      });
    }

    // Find and update booking in MongoDB
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        venta_confirmada: true,
        monto_venta: monto_venta,
        fecha_venta: new Date(),
        status: 'sold', // Change status to 'sold' when sale is confirmed
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log(`✓ Sale confirmed for ${booking.clientName}: $${monto_venta}`);

    res.json({
      success: true,
      message: 'Venta registrada exitosamente',
      booking: {
        ...booking.toObject({ virtuals: true }),
        id: booking._id.toString()
      }
    });
  } catch (error) {
    console.error('❌ Error confirming sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando venta'
    });
  }
});

// PUT - Reschedule a booking - From MongoDB (must come BEFORE /:id routes)
router.put('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    console.log(`\n📅 RESCHEDULE request for booking ID: ${id}`);
    console.log(`New date: ${date}, New time: ${time}`);

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Find booking in MongoDB
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check for conflicts with other bookings in MongoDB
    const conflict = await Booking.findOne({
      _id: { $ne: id },
      date: date,
      time: time,
      status: { $ne: 'cancelled', $ne: 'No Confirmado' }
    });

    if (conflict) {
      console.warn(`⚠️  Time slot conflict: ${date} ${time} is already booked`);
      return res.status(409).json({
        success: false,
        message: `La hora ${time} del ${date} ya está ocupada. Por favor elige otro horario.`
      });
    }

    const oldDate = booking.date;
    const oldTime = booking.time;

    // Delete old Google Calendar event
    if (booking.googleCalendarEventId) {
      try {
        await deleteGoogleCalendarEvent(booking.googleCalendarEventId);
        console.log('✓ Old calendar event deleted');
      } catch (calendarError) {
        console.warn('⚠️  Could not delete old calendar event:', calendarError.message);
      }
    }

    // Create new Google Calendar event with new date/time
    let newGoogleCalendarEventId = booking.googleCalendarEventId;
    let newMeetLink = booking.meetLink;

    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const calendarResponse = await createGoogleCalendarEvent({
        title: `Reunión con ${booking.clientName}`,
        description: `Empresa: ${booking.company}\nEmail: ${booking.email}\nTeléfono: ${booking.phone}`,
        startTime: newDateTime,
        attendeeEmail: booking.email
      });

      if (calendarResponse && calendarResponse.id) {
        newGoogleCalendarEventId = calendarResponse.id;
        newMeetLink = calendarResponse.meetLink || booking.meetLink;
        console.log('✓ New calendar event created:', newGoogleCalendarEventId);
      }
    } catch (calendarError) {
      console.warn('⚠️  Could not create new calendar event:', calendarError.message);
      // Don't fail the reschedule if calendar creation fails
    }

    // Update booking in MongoDB
    const wasUnconfirmed = booking.status === 'No Confirmado';
    
    booking.date = date;
    booking.time = time;
    booking.googleCalendarEventId = newGoogleCalendarEventId;
    booking.meetLink = newMeetLink;
    booking.status = 'confirmed'; // Change status to confirmed when rescheduled
    booking.updatedAt = new Date();
    
    await booking.save();

    console.log(`✓ Booking rescheduled: ${oldDate} ${oldTime} → ${date} ${time}`);
    if (wasUnconfirmed) {
      console.log(`✓ Status changed from "No Confirmado" to "confirmed"`);
    }

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: {
        ...booking.toObject({ virtuals: true }),
        id: booking._id.toString()
      }
    });
  } catch (error) {
    console.error('❌ Error rescheduling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling booking'
    });
  }
});

// PUT - Cancel a booking (change status to "No Confirmado") - From MongoDB
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update booking in MongoDB
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'No Confirmado',
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Try to delete from Google Calendar
    try {
      if (booking.googleCalendarEventId) {
        await deleteGoogleCalendarEvent(booking.googleCalendarEventId);
      }
    } catch (calendarError) {
      console.warn('Could not delete calendar event:', calendarError.message);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        ...booking.toObject({ virtuals: true }),
        id: booking._id.toString()
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking'
    });
  }
});

// DELETE - Delete a booking permanently - From MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🗑️  DELETE request for booking ID: ${id}`);
    
    // Find booking in MongoDB
    let booking = await Booking.findById(id);
    let bookingId = id; // Guardar el ID que será usado para eliminar

    // Si no encontramos por ID, intentar buscar por email (en caso de que el ID sea inválido)
    if (!booking) {
      console.warn(`⚠️  Booking not found with id: ${id}, intentando buscar por email...`);
      booking = await Booking.findOne({ email: id });
      
      if (!booking) {
        console.warn(`⚠️  Booking not found with id or email: ${id} - probablemente ya fue eliminado`);
        // Devolver OK de todos modos, ya que el objetivo es que no esté en la BD
        return res.json({
          success: true,
          message: 'Booking already deleted or does not exist',
          deletedBooking: null
        });
      }
      bookingId = booking._id.toString(); // Usar el ID encontrado
      console.log(`✓ Found booking by email: ${booking.clientName} (ID: ${bookingId})`);
    } else {
      console.log(`✓ Found booking by id: ${booking.clientName}`);
    }

    // Try to delete from Google Calendar
    try {
      if (booking.googleCalendarEventId) {
        await deleteGoogleCalendarEvent(booking.googleCalendarEventId);
        console.log('✓ Calendar event deleted successfully');
      }
    } catch (calendarError) {
      console.warn('⚠️  Could not delete calendar event:', calendarError.message);
      // Don't fail the entire request if calendar deletion fails
    }

    // Delete from MongoDB usando el ID correcto
    console.log(`🗑️  Intentando eliminar booking con ID: ${bookingId}`);
    const result = await Booking.findByIdAndDelete(bookingId);
    
    if (result) {
      console.log(`✓ Booking eliminado exitosamente de MongoDB:`, result._id);
    } else {
      console.warn(`⚠️  findByIdAndDelete no retornó nada (booking podría no existir)`);
    }

    res.json({
      success: true,
      message: 'Booking deleted permanently',
      deletedBooking: result ? {
        ...result.toObject({ virtuals: true }),
        id: result._id.toString()
      } : null
    });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking: ' + error.message
    });
  }
});

module.exports = router;

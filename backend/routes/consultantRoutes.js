const express = require('express');
const router = express.Router();
const Consultant = require('../models/Consultant');
const availabilityService = require('../services/availabilityService');

/**
 * GET /api/consultants
 * Obtener lista de todos los consultores activos
 */
router.get('/', async (req, res) => {
  try {
    const consultants = await Consultant.find({ isActive: true })
      .select('name email specialization bio profileImage')
      .exec();

    res.json(consultants);
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ error: 'Error al obtener consultores' });
  }
});

/**
 * GET /api/consultants/:id
 * Obtener detalles de un consultor específico
 */
router.get('/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id)
      .populate('bookings', 'date time status');

    if (!consultant) {
      return res.status(404).json({ error: 'Consultor no encontrado' });
    }

    res.json(consultant);
  } catch (error) {
    console.error('Error fetching consultant:', error);
    res.status(500).json({ error: 'Error al obtener consultor' });
  }
});

/**
 * GET /api/consultants/:id/available-times
 * Obtener horarios disponibles para una fecha específica
 * NUEVO: Muestra TODOS los días y solo excluye horarios ocupados (con reuniones confirmadas)
 * Query params: date (YYYY-MM-DD), duration (minutos)
 */
router.get('/:id/available-times', async (req, res) => {
  try {
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Se requiere parámetro: date (YYYY-MM-DD)' });
    }

    // Validar formato de fecha YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
    }

    const consultant = await Consultant.findById(req.params.id);
    if (!consultant || !consultant.isActive) {
      return res.status(404).json({ error: 'Consultor no disponible' });
    }

    // Usar la nueva función que obtiene horarios sin considerar disponibilidad configurada
    const result = await availabilityService.getAvailableSlotsSimple(
      req.params.id,
      date,
      parseInt(duration)
    );

    const durationMin = parseInt(duration);
    const availableTimes = result.availableSlots;
    const occupiedTimes = result.bookedSlots;

    // Crear lista de TODOS los slots (disponibles + ocupados)
    const allSlots = [...availableTimes, ...occupiedTimes].sort((a, b) => {
      return availabilityService.timeToMinutes(a.startTime) - availabilityService.timeToMinutes(b.startTime);
    });

    console.log(`\n📅 Disponibilidad ${date}:`);
    console.log(`   ✅ Libres: ${availableTimes.length}`);
    console.log(`   ❌ Ocupados: ${occupiedTimes.length}`);

    // Retornar datos mejorados
    res.json({
      success: true,
      date: date,
      duration: durationMin,
      availableTimes: availableTimes,      // Horarios realmente libres
      occupiedTimes: occupiedTimes,         // Horarios ocupados
      allSlots: allSlots,                  // TODOS los slots con status
      dayHasAvailability: availableTimes.length > 0,
      totalAvailable: availableTimes.length,
      totalOccupied: occupiedTimes.length,
      message: `${availableTimes.length} horarios disponibles, ${occupiedTimes.length} ocupados`
    });
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener horarios disponibles', 
      details: error.message 
    });
  }
});

/**
 * GET /api/consultants/:id/next-available
 * Obtener próximos horarios disponibles
 * Query params: days (número de días), duration (minutos)
 */
router.get('/:id/next-available', async (req, res) => {
  try {
    const { days = 30, duration = 60 } = req.query;

    const nextSlots = await availabilityService.getNextAvailableSlots(
      req.params.id,
      new Date(),
      parseInt(days),
      parseInt(duration)
    );

    res.json({
      nextAvailableSlots: nextSlots,
      totalSlots: nextSlots.length
    });
  } catch (error) {
    console.error('Error fetching next available slots:', error);
    res.status(500).json({ error: 'Error al obtener próximos horarios' });
  }
});

/**
 * POST /api/consultants/:id/check-availability
 * Verificar si un horario específico está disponible
 * Body: { date: YYYY-MM-DD, startTime: HH:MM, duration: minutos }
 */
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { date, startTime, duration = 60 } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ error: 'Se requieren: date y startTime' });
    }

    const parsedDate = new Date(date);
    const availability = await availabilityService.checkAvailability(
      req.params.id,
      parsedDate,
      startTime,
      parseInt(duration)
    );

    res.json(availability);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
});

/**
 * POST /api/consultants
 * Crear nuevo consultor (ADMIN ONLY)
 * Body: { name, email, phone, specialization, availability, ... }
 */
router.post('/', async (req, res) => {
  try {
    // TODO: Añadir autenticación admin
    const { name, email, phone, specialization, availability, googleCalendarEmail } = req.body;

    if (!name || !email || !phone || !specialization) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const newConsultant = new Consultant({
      name,
      email,
      phone,
      specialization,
      availability: availability || {
        'monday': [],
        'tuesday': [],
        'wednesday': [],
        'thursday': [],
        'friday': [],
        'saturday': [],
        'sunday': []
      },
      googleCalendarEmail
    });

    const savedConsultant = await newConsultant.save();
    res.status(201).json(savedConsultant);
  } catch (error) {
    console.error('Error creating consultant:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email ya existe' });
    }
    res.status(500).json({ error: 'Error al crear consultor' });
  }
});

/**
 * PUT /api/consultants/:id
 * Actualizar consultor (ADMIN ONLY)
 */
router.put('/:id', async (req, res) => {
  try {
    // TODO: Añadir autenticación admin
    const { name, email, phone, specialization, availability, isActive, breakTime, unavailableDates } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (specialization) updateData.specialization = specialization;
    if (availability) updateData.availability = availability;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (breakTime) updateData.breakTime = breakTime;
    if (unavailableDates) updateData.unavailableDates = unavailableDates;

    const updatedConsultant = await Consultant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedConsultant) {
      return res.status(404).json({ error: 'Consultor no encontrado' });
    }

    res.json(updatedConsultant);
  } catch (error) {
    console.error('Error updating consultant:', error);
    res.status(500).json({ error: 'Error al actualizar consultor' });
  }
});

/**
 * PUT /api/consultants/:id/availability
 * Actualizar disponibilidad de un consultor
 * Body: { monday: [...], tuesday: [...], ... }
 */
router.put('/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({ error: 'Se requiere campo: availability' });
    }

    const consultant = await Consultant.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!consultant) {
      return res.status(404).json({ error: 'Consultor no encontrado' });
    }

    res.json({
      message: 'Disponibilidad actualizada',
      availability: consultant.availability
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Error al actualizar disponibilidad' });
  }
});

/**
 * DELETE /api/consultants/:id
 * Desactivar un consultor (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Añadir autenticación admin
    const consultant = await Consultant.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!consultant) {
      return res.status(404).json({ error: 'Consultor no encontrado' });
    }

    res.json({ message: 'Consultor desactivado', consultant });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    res.status(500).json({ error: 'Error al desactivar consultor' });
  }
});

module.exports = router;

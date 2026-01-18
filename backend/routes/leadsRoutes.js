const express = require('express');
const Lead = require('../models/Lead');
const calendarService = require('../services/calendarService');
const emailService = require('../services/emailService');
const router = express.Router();

// Clasificar lead basado en consultas mensuales
const classifyLead = (monthlyConsultations) => {
  if (monthlyConsultations === '10–30' || monthlyConsultations === '30–60') {
    return 'Ideal';
  } else if (monthlyConsultations === '60+') {
    return 'Scale';
  }
  return null; // Sin clasificar (no califica)
};

// POST: Enviar aplicación
router.post('/submit-application', async (req, res) => {
  try {
    const { full_name, email, phone, monthly_consultations, scheduled_date, scheduled_time, ...otherData } = req.body;

    // Clasificar el lead
    const lead_type = classifyLead(monthly_consultations);
    
    // Determinar si califica
    const isDisqualified = lead_type === null;
    const status = isDisqualified ? 'disqualified' : 'applied';

    const newLead = new Lead({
      full_name,
      email,
      phone,
      monthly_consultations,
      lead_type,
      status,
      scheduled_date,
      scheduled_time,
      disqualified_reason: isDisqualified ? 'Menos de 10 consultas mensuales' : null,
      disqualified_at: isDisqualified ? new Date() : null,
      ...otherData
    });

    const savedLead = await newLead.save();

    // Si el lead califica, crear también un Booking
    if (!isDisqualified && scheduled_date && scheduled_time) {
      try {
        const Booking = require('../models/Booking');
        const newBooking = new Booking({
          clientName: full_name,
          email,
          phone,
          date: scheduled_date,
          time: scheduled_time,
          status: 'No Confirmado'
        });
        await newBooking.save();
      } catch (bookingError) {
        console.error('Error creating booking:', bookingError);
        // No fallar si no se puede crear el booking
      }
    }

    res.json({
      success: true,
      data: savedLead,
      disqualified: isDisqualified
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Obtener todos los leads para admin
router.get('/admin/leads', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Estadísticas
router.get('/admin/stats', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const soldLeads = await Lead.countDocuments({ status: 'sold' });
    const appliedLeads = await Lead.countDocuments({ status: 'applied' });
    const disqualifiedLeads = await Lead.countDocuments({ status: 'disqualified' });

    // Calcular ingresos
    const sales = await Lead.find({ status: 'sold' });
    const totalIncome = sales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);
    const averageIncome = soldLeads > 0 ? totalIncome / soldLeads : 0;

    // Ingresos este mes
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = await Lead.find({
      status: 'sold',
      sold_at: { $gte: monthStart }
    });
    const incomeThisMonth = monthSales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        soldLeads,
        appliedLeads,
        disqualifiedLeads,
        totalIncome,
        averageIncome,
        incomeThisMonth,
        soldThisMonth: monthSales.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT: Actualizar estado del lead
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT: Marcar como vendido
router.put('/mark-as-sold/:id', async (req, res) => {
  try {
    const { sale_amount } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sold',
        sale_amount,
        sold_at: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE: Eliminar lead
router.delete('/:id', async (req, res) => {
  try {
    const result = await Lead.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Lead eliminado'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST: Aplicar a la prueba piloto (nueva lógica de validación)
router.post('/apply-pilot', async (req, res) => {
  try {
    console.log('📥 /apply-pilot received:', JSON.stringify(req.body, null, 2));
    
    const {
      is_labor_lawyer,
      works_quota_litis,
      monthly_consultations,
      willing_to_invest_ads,
      ads_budget_range,
      main_problem,
      name,
      email,
      phone,
      scheduled_date,
      scheduled_time
    } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !phone || !monthly_consultations) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and monthly_consultations are required fields'
      });
    }

    // Validaciones de descarte automático
    const disqualificationReasons = [];

    // 1. Filtro duro: debe ser abogado laboral
    if (is_labor_lawyer === 'No' || is_labor_lawyer === false) {
      disqualificationReasons.push('Not a labor lawyer');
    }

    // 2. Volumen mensual crítico: 0-10 descarta
    if (monthly_consultations === '0–10') {
      disqualificationReasons.push('Monthly consultations too low');
    }

    // 3. Disposición a invertir en publicidad
    if (willing_to_invest_ads === 'No' || willing_to_invest_ads === false) {
      disqualificationReasons.push('Not willing to invest in ads');
    }

    // 4. Presupuesto de publicidad: < 1M descarta
    if (ads_budget_range === 'Menos de $1.000.000') {
      disqualificationReasons.push('Ads budget too low');
    }

    // Clasificar lead según volumen mensual
    let lead_type = null;
    if (monthly_consultations === '10–30' || monthly_consultations === '30–60') {
      lead_type = 'Ideal';
    } else if (monthly_consultations === '60+') {
      lead_type = 'Scale';
    }

    // Determinar si califica
    const isDisqualified = disqualificationReasons.length > 0;

    const leadData = {
      full_name: name,
      email,
      phone,
      is_labor_lawyer: is_labor_lawyer === 'Sí' || is_labor_lawyer === true,
      works_quota_litis,
      monthly_consultations,
      willing_to_invest_ads: willing_to_invest_ads === 'Sí' || willing_to_invest_ads === true,
      ads_budget_range,
      main_problem,
      lead_type: isDisqualified ? null : lead_type,
      status: isDisqualified ? 'disqualified' : 'applied',
      disqualified_reason: isDisqualified ? disqualificationReasons.join(', ') : null,
      disqualified_at: isDisqualified ? new Date() : null,
    };

    console.log('✅ leadData created:', JSON.stringify(leadData, null, 2));

    // Si tiene fecha y hora programadas, actualizar estado y crear evento en calendar
    if (scheduled_date && scheduled_time && !isDisqualified) {
      leadData.scheduled_date = scheduled_date;
      leadData.scheduled_time = scheduled_time;
      leadData.status = 'scheduled';

      // Intentar crear evento en Google Calendar
      try {
        const startTime = new Date(`${scheduled_date}T${scheduled_time}`);
        
        const calendarEvent = await calendarService.createGoogleCalendarEvent({
          title: `Reunión Piloto - ${name}`,
          description: `Reunión piloto 30 días con ${name}. Email: ${email}, Teléfono: ${phone}`,
          startTime,
          attendeeEmail: email
        });

        leadData.googleCalendarEventId = calendarEvent.eventId;
      } catch (calendarError) {
        console.error('⚠️  Error al crear evento en Google Calendar:', calendarError.message);
        // No fallar la solicitud si hay error con Google Calendar
        // El evento se puede crear manualmente después
      }
    }

    const newLead = new Lead(leadData);
    console.log('💾 Attempting to save lead with data:', JSON.stringify(leadData, null, 2));
    
    const savedLead = await newLead.save();
    console.log('✅ Lead saved successfully:', savedLead._id);

    // Send confirmation emails if the lead is scheduled
    if (scheduled_date && scheduled_time && !isDisqualified) {
      try {
        // Find the calendar event that was created
        const calendarEventId = savedLead.googleCalendarEventId || 'N/A';
        const meetLink = `https://meet.google.com/${calendarEventId}`;

        // Send email to client
        await emailService.sendPilotProgramConfirmation({
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          scheduledDate: scheduled_date,
          scheduledTime: scheduled_time,
          meetLink: meetLink
        });
        console.log('✅ Client confirmation email sent to:', email);

        // Send email to admin
        const adminEmail = process.env.EMAIL_USER || 'admin@stivenads.com';
        await emailService.sendPilotProgramNotificationToAdmin({
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          scheduledDate: scheduled_date,
          scheduledTime: scheduled_time,
          meetLink: meetLink,
          leadType: lead_type,
          budgetRange: ads_budget_range,
          mainProblems: main_problem,
          adminEmail: adminEmail
        });
        console.log('✅ Admin notification email sent to:', adminEmail);
      } catch (emailError) {
        console.error('⚠️  Error al enviar emails:', emailError.message);
        // No fallar la solicitud si hay error con los emails
      }
    }

    res.json({
      success: true,
      disqualified: isDisqualified,
      leadId: savedLead._id,
      lead_type: savedLead.lead_type,
      eventId: savedLead.googleCalendarEventId,
      message: isDisqualified ? 'Lead disqualified' : 'Lead applied and scheduled successfully'
    });
  } catch (error) {
    console.error('❌ Error in /apply-pilot:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error constructor:', error.constructor.name);
    
    // Si es un error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
    }
    
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      errorType: error.name,
      details: error.message
    });
  }
});

// POST: Track event (para analytics)
router.post('/track-event', async (req, res) => {
  try {
    const { eventName } = req.body;
    // Aquí puedes guardar los eventos en una colección de analytics
    // Por ahora solo registramos en logs
    console.log(`[Analytics] Event: ${eventName} - ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      message: 'Event tracked'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT: Actualizar schedule para un lead
router.put('/update-schedule/:id', async (req, res) => {
  try {
    const { scheduled_date, scheduled_time } = req.body;
    
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        scheduled_date,
        scheduled_time,
        status: 'scheduled',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedLead,
      message: 'Cita agendada exitosamente'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

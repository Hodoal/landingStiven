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
  // Establecer timeout extendido para operaciones de calendario y email
  req.setTimeout(90000); // 90 segundos
  
  try {
    const { full_name, email, phone, monthly_consultations, scheduled_date, scheduled_time, is_labor_lawyer, willing_to_invest_ads, ads_budget_range, ...otherData } = req.body;

    // Validaciones de descarte automático (mismo criterio que /apply-pilot)
    const disqualificationReasons = [];

    // 1. Filtro duro: debe ser abogado laboral
    if (is_labor_lawyer === 'No' || is_labor_lawyer === false) {
      disqualificationReasons.push('No es abogado laboralista');
    }

    // 2. Volumen mensual crítico: 0-10 descarta
    if (monthly_consultations === '0–10') {
      disqualificationReasons.push('Consultas mensuales muy bajas (0-10)');
    }

    // 3. Disposición a invertir en publicidad
    if (willing_to_invest_ads === 'No' || willing_to_invest_ads === false) {
      disqualificationReasons.push('No dispuesto a invertir en publicidad');
    }

    // 4. Presupuesto de publicidad: < 1M descarta
    if (ads_budget_range === 'Menos de $1.000.000') {
      disqualificationReasons.push('Presupuesto de publicidad insuficiente');
    }

    // Clasificar lead basado en consultas mensuales
    let lead_type = null;
    if (monthly_consultations === '10–30' || monthly_consultations === '30–60') {
      lead_type = 'Ideal';
    } else if (monthly_consultations === '60+') {
      lead_type = 'Scale';
    }
    
    // Determinar si califica
    const isDisqualified = disqualificationReasons.length > 0;

    // Guardar nota: si se envía fecha SIN hora, registrar y rechazar por claridad
    if (scheduled_date && !scheduled_time) {
      console.warn('🚨 submit-application received scheduled_date without scheduled_time for email:', email);
      return res.status(400).json({ success: false, message: 'scheduled_time is required when scheduled_date is provided' });
    }

    // 🔒 VALIDACIÓN DE DUPLICADOS: Verificar si ya existe un lead con el mismo email
    const existingLead = await Lead.findOne({ email });
    
    if (existingLead) {
      console.log('⚠️  Lead duplicado detectado para email:', email);
      console.log('   Lead existente ID:', existingLead._id);
      console.log('   Lead existente creado:', existingLead.createdAt);

      // Si hay scheduled_date/time y el lead existente califica, intentar actualizar o crear booking asociado
      if (!isDisqualified && scheduled_date && scheduled_time && existingLead.lead_type) {
        try {
          const Booking = require('../models/Booking');

          // Primero intentar actualizar un booking huérfano (sin fecha) para este email
          let bookingToUpdate = await Booking.findOne({ email, $or: [{ date: null }, { date: '' }, { date: { $exists: false } }, { time: null }, { time: '' }, { time: { $exists: false } }] });

          if (bookingToUpdate) {
            bookingToUpdate.date = scheduled_date;
            bookingToUpdate.time = scheduled_time;
            bookingToUpdate.status = 'scheduled';
            bookingToUpdate.leadId = existingLead._id;
            bookingToUpdate.updatedAt = new Date();
            await bookingToUpdate.save();

            console.log('✓ Booking huérfano actualizado y asociado al lead existente:', bookingToUpdate._id);

            return res.json({
              success: true,
              message: 'Booking actualizado y asociado al lead existente',
              booking: {
                id: bookingToUpdate._id.toString(),
                date: bookingToUpdate.date,
                time: bookingToUpdate.time
              }
            });
          }

          // Si no hay booking huérfano, verificar si ya existe booking para esa fecha/hora
          const sameSlot = await Booking.findOne({ email, date: scheduled_date, time: scheduled_time });
          if (sameSlot) {
            console.log('✓ Booking ya existe para ese slot, no se requiere acción');
            return res.json({ success: true, message: 'Booking ya existe para ese slot', booking: { id: sameSlot._id.toString(), date: sameSlot.date, time: sameSlot.time } });
          }

          // Si no existe, crear y asociar
          const newBooking = new Booking({
            clientName: full_name,
            email,
            phone,
            date: scheduled_date,
            time: scheduled_time,
            status: 'scheduled',
            leadId: existingLead._id
          });
          await newBooking.save();
          console.log('✓ Nuevo booking creado y asociado al lead existente:', email);

          return res.json({ success: true, message: 'Booking creado y asociado al lead existente', booking: { id: newBooking._id.toString(), date: newBooking.date, time: newBooking.time } });
        } catch (bookingError) {
          console.error('Error creating/updating booking for existing lead:', bookingError);
          // Fallamos silenciosamente y devolvemos el 409 original para compatibilidad
          return res.status(409).json({
            success: false,
            message: 'Ya existe un registro para este email',
            existingLead: {
              id: existingLead._id,
              email: existingLead.email,
              name: existingLead.full_name,
              status: existingLead.status,
              lead_type: existingLead.lead_type
            }
          });
        }
      }

      // Si no hay fecha/hora programadas o el lead no califica, responder con 409 como antes
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro para este email',
        existingLead: {
          id: existingLead._id,
          email: existingLead.email,
          name: existingLead.full_name,
          status: existingLead.status,
          lead_type: existingLead.lead_type
        }
      });
    }

    const newLead = new Lead({
      full_name,
      email,
      phone,
      monthly_consultations,
      is_labor_lawyer: is_labor_lawyer === 'Sí' || is_labor_lawyer === true,
      willing_to_invest_ads: willing_to_invest_ads === 'Sí' || willing_to_invest_ads === true,
      ads_budget_range,
      lead_type: isDisqualified ? null : lead_type,
      status: isDisqualified ? 'No califica' : 'applied',
      scheduled_date: !isDisqualified ? scheduled_date : null,
      scheduled_time: !isDisqualified ? scheduled_time : null,
      disqualified_reason: isDisqualified ? disqualificationReasons.join(', ') : null,
      disqualified_at: isDisqualified ? new Date() : null,
      ...otherData
    });

    const savedLead = await newLead.save();

    // Si el lead califica, crear también un Booking (o actualizar si existe)
    if (!isDisqualified && scheduled_date && scheduled_time) {
      try {
        const Booking = require('../models/Booking');
        
        // Verificar si ya existe un booking para este email/fecha/hora
        const existingBooking = await Booking.findOne({
          email,
          date: scheduled_date,
          time: scheduled_time
        });
        
        if (existingBooking) {
          // Actualizar booking existente
          await Booking.findByIdAndUpdate(existingBooking._id, {
            clientName: full_name,
            phone,
            status: 'scheduled', // Cambiar a 'scheduled' ya que tiene fecha/hora
            updatedAt: new Date()
          });
          console.log('✓ Booking actualizado para:', email);
        } else {
          // Crear nuevo booking solo si no existe
          const newBooking = new Booking({
            clientName: full_name,
            email,
            phone,
            date: scheduled_date,
            time: scheduled_time,
            status: 'scheduled' // Cambiar a 'scheduled' ya que tiene fecha/hora
          });
          await newBooking.save();
          console.log('✓ Nuevo booking creado para:', email);
        }
      } catch (bookingError) {
        console.error('Error creating/updating booking:', bookingError);
        // No fallar si no se puede crear/actualizar el booking
      }
    }

    res.json({
      success: true,
      data: savedLead,
      disqualified: isDisqualified
    });
  } catch (error) {
    // Handle duplicate key error from unique index
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      console.warn('Duplicate lead attempt for email:', req.body.email);
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro para este email',
        error: 'DUPLICATE_LEAD'
      });
    }
    
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
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017/stivenads-production', {
      maxPoolSize: 10,
      socketTimeoutMS: 120000
    });
    
    await client.connect();
    const db = client.db('stivenads-production');
    const leadsCollection = db.collection('leads');
    
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const leads = await leadsCollection.find(query).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
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
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017/stivenads-production', {
      maxPoolSize: 10,
      socketTimeoutMS: 120000
    });
    
    await client.connect();
    const db = client.db('stivenads-production');
    const leadsCollection = db.collection('leads');
    
    const totalLeads = await leadsCollection.countDocuments();
    const soldLeads = await leadsCollection.countDocuments({ status: 'sold' });
    const appliedLeads = await leadsCollection.countDocuments({ status: 'applied' });
    const disqualifiedLeads = await leadsCollection.countDocuments({ status: 'No califica' });

    // Calcular ingresos
    const sales = await leadsCollection.find({ status: 'sold' }).toArray();
    const totalIncome = sales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);
    const averageIncome = soldLeads > 0 ? totalIncome / soldLeads : 0;

    // Ingresos este mes
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = await leadsCollection.find({
      status: 'sold',
      sold_at: { $gte: monthStart }
    }).toArray();
    const incomeThisMonth = monthSales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);

    await client.close();

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
    const { id } = req.params;
    console.log(`\n🗑️  DELETE request for lead ID: ${id}`);
    
    // Verificar que exista antes de eliminar
    const leadBefore = await Lead.findById(id);
    if (leadBefore) {
      console.log(`📋 Lead encontrado antes de eliminar:`, leadBefore.full_name, leadBefore.email);
    } else {
      console.warn(`⚠️  Lead NOT FOUND with id: ${id} antes de eliminar`);
      return res.json({
        success: true,
        message: 'Lead ya estaba eliminado o no existe',
        deletedLead: null
      });
    }
    
    const result = await Lead.findByIdAndDelete(id);
    
    if (result) {
      console.log(`✓ Lead eliminado exitosamente:`, result.full_name, `(ID: ${result._id})`);
      
      // Verificar que se eliminó
      const leadAfter = await Lead.findById(id);
      if (leadAfter) {
        console.error(`❌ ERROR: Lead aún existe después de delete!`);
      } else {
        console.log(`✓ Verificado: Lead no existe en BD después del delete`);
      }
    } else {
      console.warn(`⚠️  findByIdAndDelete retornó null`);
    }
    
    res.json({
      success: true,
      message: 'Lead eliminado',
      deletedLead: result
    });
  } catch (error) {
    console.error('❌ Error deleting lead:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST: Aplicar a la prueba piloto (nueva lógica de validación)
router.post('/apply-pilot', async (req, res) => {
  // Establecer timeout extendido para operaciones de calendario y email
  req.setTimeout(90000); // 90 segundos
  
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

    // Convertir valores a booleanos/strings consistentes
    const isLaborLawyer = is_labor_lawyer === 'Sí' || is_labor_lawyer === true;
    const willingToInvest = willing_to_invest_ads === 'Sí' || willing_to_invest_ads === true;

    // Validaciones de descarte automático
    const disqualificationReasons = [];

    // 1. Filtro duro: debe ser abogado laboral
    if (!isLaborLawyer) {
      disqualificationReasons.push('No es abogado laboralista');
    }

    // 2. Volumen mensual crítico: 0-10 descarta
    if (monthly_consultations === '0–10') {
      disqualificationReasons.push('Consultas mensuales muy bajas (0-10)');
    }

    // 3. Disposición a invertir en publicidad
    if (!willingToInvest) {
      disqualificationReasons.push('No dispuesto a invertir en publicidad');
    }

    // 4. Presupuesto de publicidad: < 1M descarta
    if (ads_budget_range === 'Menos de $1.000.000') {
      disqualificationReasons.push('Presupuesto de publicidad insuficiente');
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

    // Validar scheduled_time cuando hay scheduled_date
    if (scheduled_date && !scheduled_time) {
      console.warn('🚨 apply-pilot received scheduled_date without scheduled_time for email:', email);
      return res.status(400).json({ success: false, message: 'scheduled_time is required when scheduled_date is provided' });
    }

    const leadData = {
      full_name: name,
      email,
      phone,
      is_labor_lawyer: isLaborLawyer,
      works_quota_litis,
      monthly_consultations,
      willing_to_invest_ads: willingToInvest,
      ads_budget_range,
      main_problem,
      lead_type: isDisqualified ? null : lead_type,
      status: isDisqualified ? 'No califica' : 'applied',
      disqualified_reason: isDisqualified ? disqualificationReasons.join(', ') : null,
      disqualified_at: isDisqualified ? new Date() : null,
    };

    console.log('✅ leadData created:', JSON.stringify(leadData, null, 2));

    // Si tiene fecha y hora programadas, actualizar estado
    if (scheduled_date && scheduled_time && !isDisqualified) {
      leadData.scheduled_date = scheduled_date;
      leadData.scheduled_time = scheduled_time;
      leadData.status = 'scheduled';
      // Calendar event creation happens in background
    }

    // Guardar o actualizar lead usando MongoClient nativo
    let savedLead;
    try {
      console.log('💾 Usando MongoClient nativo para Lead...');
      
      // Get MongoDB client
      const { MongoClient } = require('mongodb');
      const client = new MongoClient('mongodb://localhost:27017/stivenads-production', {
        maxPoolSize: 10,
        socketTimeoutMS: 120000
      });
      
      await client.connect();
      const db = client.db('stivenads-production');
      const leadsCollection = db.collection('leads');
      const bookingsCollection = db.collection('bookings');
      
      // Verificar si el lead ya existe
      const existingLead = await leadsCollection.findOne({ email });
      
      if (existingLead) {
        console.log('⚠️  Lead duplicado detectado para email:', email);
        console.log('   Lead existente ID:', existingLead._id);
        
        // Si hay scheduled_date/time, actualizar el lead y crear/actualizar booking
        if (!isDisqualified && scheduled_date && scheduled_time) {
          try {
            // Actualizar el lead con la nueva información de agendamiento
            await leadsCollection.updateOne(
              { email },
              { 
                $set: { 
                  scheduled_date, 
                  scheduled_time,
                  status: 'scheduled',
                  updatedAt: new Date()
                }
              }
            );
            console.log('✅ Lead actualizado con scheduled_date/time');
            
            // Verificar si ya existe un booking para este email
            const existingBooking = await bookingsCollection.findOne({ email });
            
            if (existingBooking) {
              // Actualizar el booking existente
              await bookingsCollection.updateOne(
                { email },
                {
                  $set: {
                    date: scheduled_date,
                    time: scheduled_time,
                    status: 'scheduled',
                    leadId: existingLead._id,
                    updatedAt: new Date()
                  }
                }
              );
              console.log('✅ Booking existente actualizado');
            } else {
              // Crear nuevo booking
              const bookingDoc = {
                leadId: existingLead._id,
                clientName: name,
                email,
                phone,
                date: scheduled_date,
                time: scheduled_time,
                status: 'scheduled',
                createdAt: new Date(),
                updatedAt: new Date()
              };
              await bookingsCollection.insertOne(bookingDoc);
              console.log('✅ Nuevo booking creado para lead existente');
            }
          } catch (updateError) {
            console.error('⚠️  Error actualizando lead/booking existente:', updateError.message);
          }
        }
        
        savedLead = existingLead;
        await client.close();
        
        // Responder con el lead existente
        return res.json({
          success: true,
          disqualified: isDisqualified,
          leadId: existingLead._id,
          lead_type: existingLead.lead_type,
          message: 'Lead already exists, updated with new scheduling info'
        });
      }
      
      // Create a lead document (solo si no existe)
      const leadDoc = {
        full_name: name,
        email,
        phone,
        is_labor_lawyer: isLaborLawyer,
        works_quota_litis,
        monthly_consultations,
        willing_to_invest_ads: willingToInvest,
        ads_budget_range,
        main_problem,
        lead_type: isDisqualified ? null : lead_type,
        status: isDisqualified ? 'No califica' : 'applied',
        scheduled_date: !isDisqualified ? scheduled_date : null,
        scheduled_time: !isDisqualified ? scheduled_time : null,
        disqualified_reason: isDisqualified ? disqualificationReasons.join(', ') : null,
        disqualified_at: isDisqualified ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert the lead
      const result = await leadsCollection.insertOne(leadDoc);
      console.log('✅ Lead created successfully:', result.insertedId);
      
      // Set savedLead with the MongoDB result
      savedLead = {
        _id: result.insertedId,
        ...leadDoc
      };

      // If the lead is not disqualified AND has scheduled_date/time, create a booking
      if (!isDisqualified && scheduled_date && scheduled_time) {
        try {
          const bookingDoc = {
            leadId: result.insertedId,
            clientName: name,
            email,
            phone,
            date: scheduled_date,
            time: scheduled_time,
            status: 'scheduled',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await bookingsCollection.insertOne(bookingDoc);
          console.log('✅ Booking created successfully for lead:', result.insertedId);
        } catch (bookingError) {
          console.error('⚠️  Error creating booking:', bookingError.message);
        }
      }
      
      await client.close();
    
    } catch (dbError) {
      console.warn('⚠️  MongoDB not available, creating mock lead:', dbError.message);
      // Crear un lead mock para continuar el flujo sin base de datos
      savedLead = {
        _id: `mock-${Date.now()}`,
        ...leadData,
        createdAt: new Date()
      };
      console.log('✅ Mock lead created:', savedLead._id);
    }

    // ⚡ RESPOND with results - Process background tasks asynchronously
    console.log('📤 Respondiendo al cliente con resultado...');
    res.json({
      success: true,
      disqualified: isDisqualified,
      leadId: savedLead._id,
      lead_type: savedLead.lead_type || leadData.lead_type,
      eventId: savedLead.googleCalendarEventId || null,
      message: isDisqualified ? 'Lead disqualified' : 'Lead applied and scheduled successfully'
    });

    // 🔄 Process calendar and emails in background (don't await, don't block response)
    setImmediate(async () => {
      try {
        console.log('🔄 Background processing started for lead:', savedLead._id);
        
        // SIEMPRE enviar email de bienvenida
        try {
          if (!isDisqualified) {
            // Lead calificado - enviar email positivo
            console.log('📧 Sending welcome email to qualified lead...');
            await emailService.sendPilotProgramConfirmation({
              clientName: name,
              clientEmail: email,
              clientPhone: phone,
              scheduledDate: scheduled_date || null,
              scheduledTime: scheduled_time || null,
              meetLink: scheduled_date && scheduled_time ? 'https://meet.google.com/' : null
            });
            console.log('✅ Background: Welcome email sent to qualified lead');
          } else {
            // Lead disqualificado - enviar email explicando
            console.log('📧 Sending disqualification email...');
            await emailService.sendDisqualificationEmail({
              clientName: name,
              clientEmail: email,
              disqualificationReasons
            });
            console.log('✅ Background: Disqualification email sent');
          }
        } catch (emailError) {
          console.error('⚠️ Error sending initial email:', emailError.message);
        }
        
        // Luego procesar calendario y emails si hay fecha programada
        if (scheduled_date && scheduled_time && !isDisqualified) {
          try {
            let meetLink = savedLead.googleMeetLink || 'https://meet.google.com/';
            
            if (!savedLead.googleCalendarEventId) {
              try {
                const startTime = new Date(`${scheduled_date}T${scheduled_time}`);
                const calendarEvent = await calendarService.createGoogleCalendarEvent({
                  title: `Reunión Piloto - ${name}`,
                  description: `Reunión piloto 30 días con ${name}. Email: ${email}, Teléfono: ${phone}`,
                  startTime,
                  attendeeEmail: email
                });
                
                meetLink = calendarEvent.meetLink;
                
                // Update lead with calendar event ID if it was saved
                if (!savedLead._id.toString().startsWith('temp-') && !savedLead._id.toString().startsWith('mock-')) {
                  try {
                    await Lead.findByIdAndUpdate(
                      savedLead._id,
                      { 
                        googleCalendarEventId: calendarEvent.eventId,
                        googleMeetLink: calendarEvent.meetLink
                      }
                    );
                    console.log('✅ Background: Calendar event ID updated in DB');
                  } catch (updateError) {
                    console.warn('⚠️  Could not update lead in DB:', updateError.message);
                  }
                }
                console.log('✅ Background: Calendar event created');
              } catch (calendarError) {
                console.error('⚠️  Background: Error creating calendar event:', calendarError.message);
              }
            }

            // Send admin email about scheduled meeting
            try {
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
              console.log('✅ Background: Admin email sent');
            } catch (emailError) {
              console.error('⚠️  Background: Error sending admin email:', emailError.message);
            }
          } catch (error) {
            console.error('⚠️  Background: Error in calendar/email processing:', error.message);
          }
        }
        
        console.log('✅ Background processing completed for lead:', savedLead._id);
      } catch (error) {
        console.error('❌ Critical error in background processing:', error.message);
      }
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
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const oldDate = lead.scheduled_date;
    const oldTime = lead.scheduled_time;

    // Delete old Google Calendar event if exists
    if (lead.googleCalendarEventId) {
      try {
        await calendarService.deleteGoogleCalendarEvent(lead.googleCalendarEventId);
        console.log('✓ Old calendar event deleted for lead');
      } catch (calendarError) {
        console.warn('⚠️  Could not delete old calendar event:', calendarError.message);
      }
    }

    // Create new Google Calendar event with new date/time
    let newGoogleCalendarEventId = lead.googleCalendarEventId;

    try {
      const startTime = new Date(`${scheduled_date}T${scheduled_time}`);
      
      const calendarEvent = await calendarService.createGoogleCalendarEvent({
        title: `Reunión Piloto - ${lead.full_name}`,
        description: `Reunión piloto 30 días con ${lead.full_name}. Email: ${lead.email}, Teléfono: ${lead.phone}`,
        startTime,
        attendeeEmail: lead.email
      });

      if (calendarEvent && calendarEvent.eventId) {
        newGoogleCalendarEventId = calendarEvent.eventId;
        console.log('✓ New calendar event created for lead:', newGoogleCalendarEventId);
      }
    } catch (calendarError) {
      console.warn('⚠️  Could not create new calendar event:', calendarError.message);
      // Don't fail the reschedule if calendar creation fails
    }

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        scheduled_date,
        scheduled_time,
        googleCalendarEventId: newGoogleCalendarEventId,
        status: 'scheduled',
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`✓ Lead rescheduled: ${oldDate} ${oldTime} → ${scheduled_date} ${scheduled_time}`);

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

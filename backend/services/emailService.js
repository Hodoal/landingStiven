const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send confirmation email
async function sendConfirmationEmail(options) {
  const { to, clientName, date, time, meetLink, confirmationToken, isOwnerEmail, clientEmail, clientPhone, company, message } = options;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

  let htmlContent;

  if (!isOwnerEmail) {
    // Email for client
    htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #f4c430 0%, #ffd700 100%); color: #0a0e27; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; }
            .details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f4c430; border-radius: 4px; }
            .detail-item { margin: 10px 0; }
            .label { font-weight: bold; color: #2d3e7f; }
            .button { display: inline-block; background: #f4c430; color: #0a0e27; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Tu Asesoría ha sido Confirmada!</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${clientName}</strong>,</p>
              <p>Nos complace confirmar que tu asesoría de marketing ha sido agendada exitosamente.</p>
              
              <div class="details">
                <div class="detail-item">
                  <span class="label">Fecha:</span> ${formattedDate}
                </div>
                <div class="detail-item">
                  <span class="label">Hora:</span> ${time}
                </div>
                <div class="detail-item">
                  <span class="label">Enlace de Google Meet:</span><br/>
                  <a href="${meetLink}" target="_blank">${meetLink}</a>
                </div>
              </div>

              <p>Por favor, une a la reunión 5 minutos antes de la hora programada.</p>

              <p>En esta asesoría:</p>
              <ul>
                <li>Analizaremos tu situación actual en marketing</li>
                <li>Identificaremos tus principales desafíos</li>
                <li>Propondremos una estrategia personalizada</li>
                <li>Definiremos próximos pasos concretos</li>
              </ul>

              <p><strong>Importante:</strong> Si necesitas reprogramar, por favor contáctanos con al menos 24 horas de anticipación.</p>

              <a href="${process.env.FRONTEND_URL}" class="button">Ir a Stivenads</a>
            </div>

            <div class="footer">
              <p>Stivenads - Asesorías de Marketing Digital</p>
              <p>Email: ${process.env.EMAIL_FROM}</p>
              <p>Este es un correo automático. No respondas directamente a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: `Confirmación de tu Asesoría - ${formattedDate}`,
      html: htmlContent
    });
  } else {
    // Email for owner
    htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; }
            .details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #7c3aed; border-radius: 4px; }
            .detail-item { margin: 10px 0; }
            .label { font-weight: bold; color: #7c3aed; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nueva Asesoría Agendada</h1>
            </div>
            
            <div class="content">
              <p>Se ha agendado una nueva asesoría con los siguientes datos:</p>
              
              <div class="details">
                <div class="detail-item">
                  <span class="label">Cliente:</span> ${clientName}
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span> ${clientEmail}
                </div>
                <div class="detail-item">
                  <span class="label">Teléfono:</span> ${clientPhone}
                </div>
                <div class="detail-item">
                  <span class="label">Empresa:</span> ${company || 'No especificada'}
                </div>
                <div class="detail-item">
                  <span class="label">Comentario del cliente:</span> ${message || 'Sin comentarios'}
                </div>
                <div class="detail-item">
                  <span class="label">Fecha:</span> ${formattedDate}
                </div>
                <div class="detail-item">
                  <span class="label">Hora:</span> ${time}
                </div>
                <div class="detail-item">
                  <span class="label">Enlace de Google Meet:</span><br/>
                  <a href="${meetLink}" target="_blank">${meetLink}</a>
                </div>
              </div>

              <a href="${process.env.FRONTEND_URL}" class="button">Ver Agendamientos</a>
            </div>

            <div class="footer">
              <p>Stivenads - Admin Dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: `Nueva Asesoría Agendada - ${clientName}`,
      html: htmlContent
    });
  }
}

// Send reschedule notification
async function sendRescheduleNotification(options) {
  const { to, clientName, oldDate, oldTime, newDate, newTime, meetLink } = options;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #f4c430 0%, #ffd700 100%); color: #0a0e27; padding: 20px; border-radius: 8px; text-align: center; }
          .content { margin: 20px 0; }
          .details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f4c430; border-radius: 4px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu Asesoría ha sido Reprogramada</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${clientName}</strong>,</p>
            <p>Tu asesoría de marketing ha sido reprogramada correctamente.</p>
            
            <div class="details">
              <p><strong>Hora Anterior:</strong> ${oldDate} a las ${oldTime}</p>
              <p><strong>Nueva Hora:</strong> ${newDate} a las ${newTime}</p>
              <p><strong>Enlace de Google Meet:</strong> ${meetLink}</p>
            </div>

            <p>Todos los cambios han sido aplicados. Te esperamos en la nueva fecha y hora.</p>
          </div>

          <div class="footer">
            <p>Stivenads - Asesorías de Marketing Digital</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Tu asesoría ha sido reprogramada - Stivenads`,
    html: htmlContent
  });
}

// Send cancellation notification
async function sendCancellationEmail(options) {
  const { to, clientName, date, time } = options;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { background: #f44336; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu Asesoría ha sido Cancelada</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${clientName}</strong>,</p>
            <p>Lamentamos confirmar que tu asesoría agendada para ${date} a las ${time} ha sido cancelada.</p>
            <p>Si deseas agendar una nueva asesoría, por favor visita nuestra plataforma.</p>
          </div>

          <div class="footer">
            <p>Stivenads - Asesorías de Marketing Digital</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Tu asesoría ha sido cancelada - Stivenads`,
    html: htmlContent
  });
}

// Send pilot program confirmation email to client
async function sendPilotProgramConfirmation(options) {
  const { clientName, clientEmail, clientPhone, scheduledDate, scheduledTime, meetLink } = options;

  const formattedDate = new Date(scheduledDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a2844; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px; }
          .welcome { font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px; }
          .details-box { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 5px solid #fbbf24; }
          .detail-row { display: flex; justify-content: space-between; margin: 12px 0; }
          .detail-label { font-weight: bold; color: #1a2844; }
          .detail-value { color: #555; }
          .highlight { background-color: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #fbbf24; }
          .highlight ul { margin: 10px 0; padding-left: 20px; }
          .highlight li { margin: 8px 0; color: #555; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a2844; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .meet-link { background: #f0f9ff; border: 2px solid #0284c7; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center; }
          .meet-link a { color: #0284c7; text-decoration: none; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 12px; color: #666; }
          .footer-logo { font-weight: bold; color: #1a2844; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a este piloto de 30 días!</h1>
            <p>Tu reunión ha sido confirmada</p>
          </div>

          <div class="content">
            <div class="welcome">
              <p>Hola <strong>${clientName}</strong>,</p>
              <p>Nos complace informarte que has sido aceptado en nuestro <strong>Programa Piloto de 30 días</strong>. Esta es una oportunidad exclusiva donde con mi sistema de adquisición y pre-calificación de clientes potenciales, tendrás muchos más clientes <strong>PERO QUE SI CALIFICAN</strong></p>
            </div>

            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value"><strong>${formattedDate}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value"><strong>${scheduledTime}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📞 Teléfono de contacto:</span>
                <span class="detail-value">${clientPhone}</span>
              </div>
            </div>

            <div class="highlight">
              <strong>¿Qué esperar en la primera reunión?</strong>
              <ul>
                <li>Análisis de tu situación actual de tus servicios como abogado</li>
                <li>Identificación de tus cuellos de botellas o dolores del servicio</li>
                <li>Estrategia personalizada para tu servicio</li>
                <li>Plan de acción concreto para los próximos 30 días</li>
              </ul>
            </div>

            <div class="meet-link">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Enlace de Google Meet:</p>
              <a href="${meetLink}" target="_blank" style="font-size: 16px;">${meetLink}</a>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>Importante:</strong> Por favor, únete a la reunión 5 minutos antes de la hora programada. Prepara un espacio tranquilo y asegúrate de tener buena conexión a internet.
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Si necesitas reprogramar o tienes preguntas, no dudes en contactarnos a la línea de WhatsApp donde confirmaremos la reunión 1 día antes.
            </p>

            <center>
              <a href="${process.env.FRONTEND_URL}" class="cta-button">Ir a Stivenads</a>
            </center>
          </div>

          <div class="footer">
            <p class="footer-logo">Stivenads</p>
            <p>Implemento sistema de pre-calificación para abogados laborales en Colombia.</p>
            <p>noreply@stivenads.com</p>
            <p>Este es un correo automático. No respondas directamente a este mensaje.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: clientEmail,
    subject: `🎉 ¡Bienvenido al Programa Piloto Stiven Ads! - Reunión confirmada para ${formattedDate}`,
    html: htmlContent
  });
}

// Send pilot program notification email to admin/organizer
async function sendPilotProgramNotificationToAdmin(options) {
  const { clientName, clientEmail, clientPhone, scheduledDate, scheduledTime, meetLink, leadType, budgetRange, mainProblems, adminEmail } = options;

  const formattedDate = new Date(scheduledDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

  const problemsList = Array.isArray(mainProblems) ? mainProblems.join(', ') : mainProblems;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px; }
          .notification { background: #f0f9ff; border-left: 5px solid #0284c7; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
          .notification p { margin: 0; color: #0c4a6e; }
          .client-info { background: #f5f7fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; color: #1a2844; min-width: 150px; }
          .info-value { color: #555; text-align: right; }
          .meeting-details { background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 5px solid #f59e0b; }
          .meeting-details h3 { margin: 0 0 15px 0; color: #92400e; }
          .detail-row { margin: 12px 0; }
          .detail-label { font-weight: bold; color: #92400e; }
          .detail-value { color: #78350f; }
          .status-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .meet-link { background: white; border: 2px solid #0284c7; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center; }
          .meet-link a { color: #0284c7; text-decoration: none; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 Nueva Solicitud del Programa Piloto</h1>
            <p><span class="status-badge">Confirmada</span></p>
          </div>

          <div class="content">
            <div class="notification">
              <p><strong>${clientName}</strong> ha sido aceptado en el programa piloto y tiene una reunión agendada.</p>
            </div>

            <h3 style="color: #1a2844; margin-top: 0;">Información del Cliente</h3>
            <div class="client-info">
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value"><strong>${clientName}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value"><strong>${clientEmail}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value"><strong>${clientPhone}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Tipo de Lead:</span>
                <span class="info-value"><strong>${leadType}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Presupuesto:</span>
                <span class="info-value"><strong>${budgetRange}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Problemas Principales:</span>
                <span class="info-value"><strong>${problemsList}</strong></span>
              </div>
            </div>

            <h3 style="color: #1a2844;">Detalles de la Reunión</h3>
            <div class="meeting-details">
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value"><strong>${formattedDate}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value"><strong>${scheduledTime}</strong></span>
              </div>
              <div class="meet-link">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #78350f;">Enlace de Google Meet:</p>
                <a href="${meetLink}" target="_blank">${meetLink}</a>
              </div>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px; background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
              ✓ El cliente ha recibido un email de confirmación con todos los detalles de la reunión.
            </p>
          </div>

          <div class="footer">
            <p><strong>Stivenads Admin</strong></p>
            <p>Programa Piloto - Sistema de Notificaciones</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `📩 Nueva Solicitud Piloto - ${clientName} - ${formattedDate}`,
    html: htmlContent
  });
}

// Send disqualification email to client
async function sendDisqualificationEmail(options) {
  const { clientName, clientEmail, disqualificationReasons } = options;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { background: #f9f9f9; color: #666; padding: 20px; border-radius: 8px; text-align: center; }
          .content { margin: 20px 0; }
          .reasons { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Gracias por tu interés en el Programa Piloto</h2>
          </div>
          
          <div class="content">
            <p>Hola <strong>${clientName}</strong>,</p>
            
            <p>Apreciamos mucho tu interés en nuestro Programa Piloto de 30 días. Sin embargo, en este momento no cumple con todos los requisitos necesarios.</p>
            
            <div class="reasons">
              <p><strong>Razones:</strong></p>
              <ul>
                ${disqualificationReasons.map(reason => `<li>${reason}</li>`).join('')}
              </ul>
            </div>
            
            <p>Esto no significa que no sea un potencial cliente en el futuro. Si tu situación cambia o tienes preguntas, no dudes en contactarnos.</p>
            
            <p>¡Muchas gracias!</p>
          </div>
          
          <div class="footer">
            <p>Stivenads - Asesorías Especializadas</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: clientEmail,
    subject: 'Estatus de tu Solicitud - Programa Piloto',
    html: htmlContent
  });
}

module.exports = {
  sendConfirmationEmail,
  sendRescheduleNotification,
  sendCancellationEmail,
  sendPilotProgramConfirmation,
  sendPilotProgramNotificationToAdmin,
  sendDisqualificationEmail
};

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
    day: 'numeric'
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

module.exports = {
  sendConfirmationEmail,
  sendRescheduleNotification,
  sendCancellationEmail
};

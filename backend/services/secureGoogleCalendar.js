const { google } = require('googleapis');
const { tokenManager } = require('./tokenManager');

/**
 * Wrapper para operaciones de Google Calendar con manejo automático de tokens
 * Esta clase asegura que todas las operaciones se realicen con tokens válidos
 */
class SecureGoogleCalendar {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.operationTimeout = 60000; // 60 segundos de timeout por operación
  }

  /**
   * Ejecuta una operación de calendario con manejo automático de tokens
   * @param {Function} operation - Función que realiza la operación de calendario
   * @param {string} operationName - Nombre de la operación para logging
   * @param {number} retryAttempt - Número de intento actual
   * @returns {Promise<any>} Resultado de la operación
   */
  async executeWithTokenValidation(operation, operationName = 'Calendar operation', retryAttempt = 0) {
    try {
      console.log(`\n🔐 SecureGoogleCalendar: Starting ${operationName} (attempt ${retryAttempt + 1}/${this.maxRetries + 1})`);
      
      // Obtener cliente validado con token renovado si es necesario
      const validatedClient = await tokenManager.getValidatedClient();
      
      if (!validatedClient) {
        throw new Error('Could not obtain valid Google OAuth2 client. Please check your credentials and refresh token.');
      }

      // Crear instancia de Google Calendar con el cliente validado
      const calendar = google.calendar({ version: 'v3', auth: validatedClient });
      
      // Ejecutar la operación con timeout
      const result = await Promise.race([
        operation(calendar),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timeout: ${operationName} took too long (${this.operationTimeout}ms)`)), this.operationTimeout)
        )
      ]);
      
      console.log(`✅ SecureGoogleCalendar: ${operationName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ SecureGoogleCalendar: Error in ${operationName}:`, error.message);
      
      // Si el error es de autenticación y no hemos alcanzado el máximo de intentos, retry
      if (this.isAuthenticationError(error) && retryAttempt < this.maxRetries) {
        console.log(`🔄 SecureGoogleCalendar: Authentication error detected, retrying ${operationName}...`);
        
        // Forzar renovación del token
        await tokenManager.forceRefresh();
        
        // Esperar un poco antes del retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));
        
        // Retry la operación
        return await this.executeWithTokenValidation(operation, operationName, retryAttempt + 1);
      }
      
      // Si no es un error de auth o ya hemos intentado demasiadas veces, lanzar el error
      throw new Error(`${operationName} failed: ${error.message}`);
    }
  }

  /**
   * Verifica si un error es relacionado con autenticación
   * @param {Error} error - Error a verificar
   * @returns {boolean} true si es un error de autenticación
   */
  isAuthenticationError(error) {
    const authErrorCodes = [401, 403];
    const authErrorMessages = [
      'invalid_token',
      'expired_token',
      'invalid_grant',
      'unauthorized',
      'forbidden',
      'token_expired',
      'invalid_credentials'
    ];

    // Verificar código de estado HTTP
    if (error.status && authErrorCodes.includes(error.status)) {
      return true;
    }

    // Verificar mensaje de error
    if (error.message) {
      const errorMessage = error.message.toLowerCase();
      return authErrorMessages.some(authMsg => errorMessage.includes(authMsg));
    }

    return false;
  }

  /**
   * Crea un evento en Google Calendar con manejo automático de tokens
   * @param {object} eventOptions - Opciones del evento
   * @returns {Promise<object>} Información del evento creado
   */
  async createEvent(eventOptions) {
    const { title, description, startTime, attendeeEmail } = eventOptions;
    
    // Calcular tiempo de finalización (1 hora después del inicio)
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const eventData = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Bogota'
      },
      attendees: [
        { email: attendeeEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: `stivenads-${Date.now()}`
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 día antes
          { method: 'popup', minutes: 30 } // 30 minutos antes
        ]
      }
    };

    return await this.executeWithTokenValidation(
      async (calendar) => {
        const response = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          resource: eventData,
          sendNotifications: true,
          conferenceDataVersion: 1
        });

        return {
          eventId: response.data.id,
          meetLink: response.data.hangoutLink || `https://meet.google.com/${response.data.id}`
        };
      },
      'Create Calendar Event'
    );
  }

  /**
   * Lista eventos en un rango de fechas con manejo automático de tokens
   * @param {string} timeMin - Fecha/hora mínima en ISO string
   * @param {string} timeMax - Fecha/hora máxima en ISO string
   * @returns {Promise<Array>} Lista de eventos
   */
  async listEvents(timeMin, timeMax) {
    return await this.executeWithTokenValidation(
      async (calendar) => {
        const response = await calendar.events.list({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          timeZone: 'America/Bogota'
        });

        return response.data.items || [];
      },
      'List Calendar Events'
    );
  }

  /**
   * Elimina un evento de Google Calendar con manejo automático de tokens
   * @param {string} eventId - ID del evento a eliminar
   * @returns {Promise<boolean>} true si se eliminó exitosamente
   */
  async deleteEvent(eventId) {
    return await this.executeWithTokenValidation(
      async (calendar) => {
        await calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId
        });
        return true;
      },
      'Delete Calendar Event'
    );
  }

  /**
   * Actualiza un evento de Google Calendar con manejo automático de tokens
   * @param {string} eventId - ID del evento a actualizar
   * @param {object} eventData - Datos del evento a actualizar
   * @returns {Promise<object>} Evento actualizado
   */
  async updateEvent(eventId, eventData) {
    return await this.executeWithTokenValidation(
      async (calendar) => {
        const response = await calendar.events.update({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId,
          resource: eventData
        });
        return response.data;
      },
      'Update Calendar Event'
    );
  }

  /**
   * Obtiene información sobre un evento específico con manejo automático de tokens
   * @param {string} eventId - ID del evento
   * @returns {Promise<object>} Información del evento
   */
  async getEvent(eventId) {
    return await this.executeWithTokenValidation(
      async (calendar) => {
        const response = await calendar.events.get({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId
        });
        return response.data;
      },
      'Get Calendar Event'
    );
  }
}

// Crear instancia singleton
const secureGoogleCalendar = new SecureGoogleCalendar();

module.exports = {
  SecureGoogleCalendar,
  secureGoogleCalendar
};
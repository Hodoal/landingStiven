const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const { secureGoogleCalendar } = require('./secureGoogleCalendar');
const { tokenManager } = require('./tokenManager');

// Helper function to check if Google Calendar is properly configured
function isGoogleCalendarConfigured() {
  const hasAllRequired = 
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret' &&
    process.env.GOOGLE_CALENDAR_ID &&
    process.env.GOOGLE_CALENDAR_ID !== 'your_google_calendar_id' &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_REFRESH_TOKEN !== 'your_google_refresh_token';
  
  return hasAllRequired;
}

// Legacy OAuth2 client for backward compatibility
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials if refresh token is available
if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN !== 'your_google_refresh_token') {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

// Legacy calendar client - now we'll use secureGoogleCalendar instead
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Create Google Calendar event with automatic token management
async function createGoogleCalendarEvent(options) {
  const { title, description, startTime, attendeeEmail } = options;

  // Check if Google Calendar is configured
  if (!isGoogleCalendarConfigured()) {
    console.log('⚠️  Google Calendar not fully configured, skipping event creation');
    return {
      eventId: 'mock-' + Date.now(),
      meetLink: 'https://meet.google.com/placeholder'
    };
  }

  try {
    console.log('🚀 Creating Google Calendar event with automatic token management');
    
    // Use the secure calendar service which handles token validation/renewal automatically
    const result = await secureGoogleCalendar.createEvent({
      title,
      description,
      startTime,
      attendeeEmail
    });
    
    console.log('✅ Calendar event created successfully:', {
      eventId: result.eventId,
      meetLink: result.meetLink
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error creating Google Calendar event:', error.message);
    
    // Fallback to mock event if calendar service fails
    console.log('🔄 Falling back to mock event due to calendar error');
    return {
      eventId: 'mock-' + Date.now(),
      meetLink: 'https://meet.google.com/placeholder'
    };
  }
}

// Get available slots for a date
async function getAvailableSlots(dateInput) {
  try {
    // Parse date string "2026-01-12" and create query range in Bogota time
    let year, month, day;
    
    if (typeof dateInput === 'string') {
      // dateInput format: "2026-01-12"
      [year, month, day] = dateInput.split('-').map(Number);
    } else {
      const d = new Date(dateInput);
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    }

    // Create date range for this day in Bogota timezone
    // Bogota is UTC-5, so:
    // - Day start in Bogota (00:00) = Day at UTC 05:00
    // - Day end in Bogota (23:59:59) = Next day at UTC 04:59:59
    const dayStart = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999));

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log(`\n🔍 Checking availability for ${dateStr}`);
    console.log(`📅 Query range (Bogota): ${dayStart.toLocaleString('es-CO')} to ${dayEnd.toLocaleString('es-CO')}`);
    console.log(`⏰ Query range (UTC): ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);

    // Return default slots if Google Calendar is not configured
    if (!isGoogleCalendarConfigured()) {
      console.log('⚠️  Google Calendar not fully configured, returning default slots');
      return calculateAvailableSlots([]);
    }

    // Use secure calendar service for token management
    const events = await secureGoogleCalendar.listEvents(
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    console.log(`\n📊 Found ${events.length} event(s) on this date`);
    
    if (events.length > 0) {
      console.log('\n📋 Event Details:');
    }
    
    const bookedSlots = events
      .filter(event => event.start.dateTime) // Only include events with specific times
      .map((event, index) => {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        console.log(`  Event ${index + 1}: "${event.summary}"`);
        console.log(`    Start (UTC): ${start.toISOString()}`);
        console.log(`    End (UTC): ${end.toISOString()}`);
        console.log(`    Start (Bogota): ${start.toLocaleString('es-CO')}`);
        console.log(`    End (Bogota): ${end.toLocaleString('es-CO')}`);
        return {
          start: event.start.dateTime,
          end: event.end.dateTime,
          title: event.summary
        };
      });

    const availableSlots = calculateAvailableSlots(bookedSlots);
    
    console.log(`\n✅ Available slots (${availableSlots.length}):`, availableSlots);
    console.log(`❌ Booked slots (${bookedSlots.length})`);

    return {
      date: dateStr,
      bookedSlots,
      availableSlots
    };
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
}

// Calculate available slots based on booked times
function calculateAvailableSlots(bookedSlots) {
  console.log('\n🔄 Calculating available slots...');
  
  // Generate all possible slots: 8:00 AM to 10:00 PM in 1-hour intervals
  const allSlots = [];
  for (let i = 8; i <= 22; i++) {
    allSlots.push(`${String(i).padStart(2, '0')}:00`);
  }

  console.log(`  Total possible slots: ${allSlots.length}`);
  console.log(`  Slot range: 08:00 to 22:00 (1-hour intervals)`);

  // Create a Set of booked time ranges (hour-level blocking)
  const bookedTimes = new Set();
  
  bookedSlots.forEach((slot, slotIndex) => {
    console.log(`\n  Processing booked event ${slotIndex + 1}:`);
    const startTime = new Date(slot.start);
    const endTime = new Date(slot.end);
    
    console.log(`    Start: ${startTime.toLocaleString('es-CO')}`);
    console.log(`    End: ${endTime.toLocaleString('es-CO')}`);

    // Get hours that this event spans
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      // Format current time in local timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(currentTime);
      const hours = parts.find(p => p.type === 'hour').value;
      const timeStr = `${hours}:00`; // Always block full hour (HH:00)
      
      if (!bookedTimes.has(timeStr)) {
        bookedTimes.add(timeStr);
        console.log(`      ⏸️  Blocking hour: ${timeStr}`);
      }
      
      // Increment by 1 hour
      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    }
  });

  console.log(`\n  Total booked hours: ${bookedTimes.size}`);
  console.log(`  Booked times: ${Array.from(bookedTimes).sort().join(', ')}`);

  const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));
  
  console.log(`  Available slots after filtering: ${availableSlots.length}`);
  console.log(`  Available: ${availableSlots.join(', ')}\n`);

  return availableSlots;
}

// Delete Google Calendar event with automatic token management
async function deleteGoogleCalendarEvent(eventId) {
  try {
    console.log(`🗑️ Deleting Google Calendar event: ${eventId}`);
    
    // Use secure calendar service for automatic token management
    const result = await secureGoogleCalendar.deleteEvent(eventId);
    
    console.log('✅ Calendar event deleted successfully');
    return result;
  } catch (error) {
    console.error('❌ Error deleting Google Calendar event:', error.message);
    throw error;
  }
}

// Get available dates for a given month
// Returns an array of available dates (YYYY-MM-DD format)
async function getAvailableDatesByMonth(year, month) {
  try {
    // Return all dates as available if Google Calendar is not configured
    if (!isGoogleCalendarConfigured()) {
      console.log('⚠️  Google Calendar not fully configured, returning all dates as available');
      const daysInMonth = new Date(year, month, 0).getDate();
      const availableDates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        availableDates.push(dateStr);
      }
      return availableDates;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const availableDates = [];
    const bookedDates = new Set();

    // Get all events for the entire month
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 5, 0, 0, 0)); // Start at 00:00 Bogota time
    const monthEnd = new Date(Date.UTC(year, month, 1, 4, 59, 59, 999)); // End at 23:59:59 Bogota time

    console.log(`\n🔍 Checking availability for ${year}-${String(month).padStart(2, '0')}`);
    console.log(`📅 Query range: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);

    // Use secure calendar service for token management
    const events = await secureGoogleCalendar.listEvents(
      monthStart.toISOString(),
      monthEnd.toISOString()
    );
    console.log(`📊 Found ${events.length} event(s) in this month`);

    // Mark dates with events as booked
    events.forEach(event => {
      if (event.start.dateTime) {
        const eventDate = event.start.dateTime.split('T')[0];
        bookedDates.add(eventDate);
        console.log(`  ❌ ${eventDate} - ${event.summary}`);
      }
    });

    // Build list of available dates
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Only include dates that are not booked
      if (!bookedDates.has(dateStr)) {
        availableDates.push(dateStr);
      }
    }

    console.log(`✅ Available dates: ${availableDates.length} out of ${daysInMonth}`);
    return availableDates;
  } catch (error) {
    console.error('Error getting available dates:', error);
    // Return all dates as available if there's an error
    const daysInMonth = new Date(year, month, 0).getDate();
    const availableDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      availableDates.push(dateStr);
    }
    return availableDates;
  }
}

module.exports = {
  createGoogleCalendarEvent,
  getAvailableSlots,
  deleteGoogleCalendarEvent,
  getAvailableDatesByMonth,
  // Token management functions
  getTokenStatus: () => tokenManager.getTokenStatus(),
  forceTokenRefresh: () => tokenManager.forceRefresh(),
  isGoogleCalendarConfigured
};

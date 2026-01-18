const { google } = require('googleapis');
const { OAuth2 } = google.auth;

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

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Create Google Calendar event
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

  // Calculate end time (1 hour after start)
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  try {
    const event = {
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
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 minutes before
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      sendNotifications: true,
      conferenceDataVersion: 1
    });

    // Return both event ID and the generated Meet link
    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink || `https://meet.google.com/${response.data.id}`
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
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

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'America/Bogota'
    });

    const events = response.data.items || [];
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
  
  // Generate all possible slots (8:00 to 17:30 in 30-min intervals)
  const allSlots = [];
  for (let i = 8; i < 18; i++) {
    allSlots.push(`${String(i).padStart(2, '0')}:00`);
    if (i < 17) { // Don't add :30 for 18:00
      allSlots.push(`${String(i).padStart(2, '0')}:30`);
    }
  }

  console.log(`  Total possible slots: ${allSlots.length}`);

  // Create a Set of booked time ranges
  const bookedTimes = new Set();
  
  bookedSlots.forEach((slot, slotIndex) => {
    console.log(`\n  Processing booked slot ${slotIndex + 1}:`);
    const startTime = new Date(slot.start);
    const endTime = new Date(slot.end);
    
    console.log(`    Duration: ${startTime.toLocaleString('es-CO')} to ${endTime.toLocaleString('es-CO')}`);

    // For each 30-minute interval during the booked time, mark as unavailable
    let currentTime = new Date(startTime);
    let intervalCount = 0;
    
    while (currentTime < endTime) {
      // Format current time in local timezone using Intl
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(currentTime);
      const hours = parts.find(p => p.type === 'hour').value;
      const minutes = parts.find(p => p.type === 'minute').value;
      const timeStr = `${hours}:${minutes}`;
      
      bookedTimes.add(timeStr);
      intervalCount++;
      
      console.log(`      ⏸️  Marking as booked: ${timeStr}`);
      
      // Increment by 30 minutes
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
    
    console.log(`    Total intervals blocked: ${intervalCount}`);
  });

  console.log(`\n  Total booked time slots: ${bookedTimes.size}`);
  console.log(`  Booked times: ${Array.from(bookedTimes).sort().join(', ')}`);

  const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));
  
  console.log(`  Available slots after filtering: ${availableSlots.length}`);
  console.log(`  Available: ${availableSlots.join(', ')}\n`);

  return availableSlots;
}

// Delete Google Calendar event
async function deleteGoogleCalendarEvent(eventId) {
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId
    });
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
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

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: monthStart.toISOString(),
      timeMax: monthEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'America/Bogota'
    });

    const events = response.data.items || [];
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
  getAvailableDatesByMonth
};

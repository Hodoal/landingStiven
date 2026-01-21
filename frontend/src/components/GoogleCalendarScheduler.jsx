import React, { useState } from 'react';
import './GoogleCalendarScheduler.css';
import { FiCalendar, FiClock } from 'react-icons/fi';

export default function GoogleCalendarScheduler({ onDateChange, onTimeChange }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    onTimeChange(time);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const times = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <div className="calendar-scheduler">
      <h3>Agendar reunión de 30 minutos</h3>
      
      <div className="scheduler-group">
        <label>
          <FiCalendar /> Selecciona fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={minDate}
          className="date-input"
        />
      </div>

      {selectedDate && (
        <div className="scheduler-group">
          <label>
            <FiClock /> Selecciona hora
          </label>
          <div className="time-grid">
            {times.map(time => (
              <button
                key={time}
                onClick={() => handleTimeChange(time)}
                className={`time-slot ${selectedTime === time ? 'active' : ''}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="confirmation">
          <p>✓ Reunión agendada para {selectedDate} a las {selectedTime}</p>
        </div>
      )}
    </div>
  );
}

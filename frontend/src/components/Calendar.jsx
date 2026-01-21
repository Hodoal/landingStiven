import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import './Calendar.css'

function Calendar({ onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
    }

    return days
  }

  const isDateDisabled = (date) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Solo deshabilitar si es fecha pasada
    return date < today
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const days = generateCalendarDays()
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const pulseVariants = {
    pulse: {
      scale: [1, 1.15, 1],
      boxShadow: [
        '0 0 0 0px rgba(93, 76, 255, 0.7)',
        '0 0 0 15px rgba(93, 76, 255, 0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          <FiChevronLeft />
        </button>
        <h3>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h3>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          <FiChevronRight />
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((date, index) => (
          <motion.button
            key={index}
            className={`calendar-day ${isDateSelected(date) ? 'selected' : ''} ${isDateDisabled(date) ? 'disabled' : ''} ${isToday(date) ? 'today' : ''}`}
            onClick={() => {
              if (!isDateDisabled(date)) {
                onDateSelect && onDateSelect(date)
              }
            }}
            whileHover={!isDateDisabled(date) ? { scale: 1.1 } : {}}
            whileTap={!isDateDisabled(date) ? { scale: 0.95 } : {}}
            disabled={isDateDisabled(date)}
            variants={isToday(date) && !isDateDisabled(date) ? pulseVariants : {}}
            animate={isToday(date) && !isDateDisabled(date) ? 'pulse' : ''}
          >
            {date ? date.getDate() : ''}
            {isToday(date) && <span className="today-label">HOY</span>}
          </motion.button>
        ))}
      </div>

      <div className="calendar-hint">
        <FiCalendar className="calendar-hint-icon" size={20} />
        <p>Agenda hoy y obtén tu consulta esta semana!</p>
      </div>
    </div>
  )
}

export default Calendar

import React, { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './MinimalCalendar.css'

export default function MinimalCalendar({ onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    
    // Solo permitir si no es una fecha pasada
    if (!isPastDate(day)) {
      onDateSelect(dateString)
    }
  }
  
  const getMonthYear = () => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }
  
  const days = []
  const totalDays = daysInMonth(currentDate)
  const firstDay = firstDayOfMonth(currentDate)
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }
  
  const isToday = (day) => {
    if (!day) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }
  
  const isSelected = (day) => {
    if (!day || !selectedDate) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    return dateString === selectedDate
  }
  
  const isPastDate = (day) => {
    if (!day) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    // Permitir HOY y todas las fechas futuras (no pasadas)
    // Comparar: si date es MENOR a today, es pasada
    return date < today
  }
  
  const isDateDisabled = (day) => {
    // Solo deshabilitar si es fecha pasada
    // Permitir todos los días futuros
    if (!day) return true
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return date < today
  }
  
  return (
    <div className="modern-calendar">
      <div className="calendar-header-modern">
        <button onClick={handlePrevMonth} className="nav-button-modern">
          <FiChevronLeft size={18} />
        </button>
        <h3 className="month-year-modern">{getMonthYear()}</h3>
        <button onClick={handleNextMonth} className="nav-button-modern">
          <FiChevronRight size={18} />
        </button>
      </div>
      
      <div className="weekdays-modern">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
          <div key={day} className="weekday-modern">{day}</div>
        ))}
      </div>
      
      <div className="days-grid-modern">
        {days.map((day, index) => (
          <div key={index} className="day-cell-modern">
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                className={`day-number-modern
                  ${isToday(day) ? 'today' : ''} 
                  ${isSelected(day) ? 'selected' : ''} 
                  ${isDateDisabled(day) ? 'disabled' : 'available'}
                `}
                disabled={isDateDisabled(day)}
                title={isDateDisabled(day) ? 'Fecha pasada' : 'Seleccionar'}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

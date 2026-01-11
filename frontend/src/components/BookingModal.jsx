import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiArrowLeft, FiArrowRight, FiClock, FiCalendar } from 'react-icons/fi'
import Calendar from './Calendar'
import './BookingModal.css'
import axios from 'axios'

function BookingModal({ onClose }) {
  const [step, setStep] = useState('form') // form, calendar, confirmation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [availableTimes, setAvailableTimes] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    // Limpiar el textarea cuando se monta el componente
    const textarea = document.querySelector('textarea[name="message"]')
    if (textarea) {
      textarea.value = ''
    }
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.phone) {
      setStep('calendar')
    }
  }

  const handleDateSelect = async (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setLoading(true)
    try {
      // Llamar al backend para obtener horarios disponibles
      const response = await axios.get(`/api/booking/available-times`, {
        params: { date: date.toISOString().split('T')[0] }
      })
      setAvailableTimes(response.data.times || generateTimeSlots())
      setBookedSlots(response.data.bookedSlots || [])
      console.log('Available times:', response.data.times)
      console.log('Booked slots:', response.data.bookedSlots)
    } catch (error) {
      console.error('Error fetching available times:', error)
      setAvailableTimes(generateTimeSlots())
      setBookedSlots([])
    }
    setLoading(false)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 8; i < 18; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`)
      slots.push(`${String(i).padStart(2, '0')}:30`)
    }
    return slots
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return
    
    setLoading(true)
    try {
      const response = await axios.post('/api/booking/create', {
        ...formData,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime
      })
      
      if (response.data.success) {
        setStep('confirmation')
      } else {
        alert('Error: ' + (response.data.message || 'No se pudo agendar'))
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      alert('Error al agendar: ' + errorMessage)
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <FiX size={24} />
        </button>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="modal-step"
            >
              <h2>Cuéntanos sobre ti</h2>
              <p>Completa tus datos para agendar tu asesoría</p>
              
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+57 300 000 0000"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Nombre de tu empresa"
                    value={formData.company}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Cuéntanos tu situación (opcional)</label>
                  <textarea
                    name="message"
                    placeholder="¿Cuál es tu principal desafío?"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows="3"
                    autoComplete="off"
                    form="nofill"
                  />
                </div>

                <button type="submit" className="main-cta">
                  Siguiente
                </button>
              </form>
            </motion.div>
          )}

          {step === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="modal-step"
            >
              <h2>Elige tu Fecha y Hora</h2>
              <p>Selecciona el mejor momento para ti</p>

              <div className="calendar-section">
                <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
              </div>

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="time-slots"
                >
                  <h3>Horarios disponibles: {selectedDate.toLocaleDateString('es-ES')}</h3>
                  <div className="slots-grid">
                    {availableTimes && availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <button
                          key={time}
                          className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          <FiClock size={16} />
                          {time}
                        </button>
                      ))
                    ) : (
                      <p className="no-availability">No hay horarios disponibles para esta fecha</p>
                    )}
                  </div>
                  {bookedSlots.length > 0 && (
                    <p className="booked-info">({generateTimeSlots().length - availableTimes.length} horarios ocupados)</p>
                  )}
                </motion.div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setStep('form')}>
                  <FiArrowLeft /> Atrás
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || loading}
                >
                  {loading ? 'Agendando...' : 'Confirmar Agendamiento'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-step confirmation"
            >
              <div className="confirmation-icon">
                <FiCalendar size={48} />
              </div>
              <h2>¡Agendamiento Confirmado!</h2>
              <p>Hemos enviado los detalles a tu email</p>
              
              <div className="confirmation-details">
                <p><strong>Nombre:</strong> {formData.name}</p>
                <p><strong>Fecha:</strong> {selectedDate?.toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Enlace de Google Meet:</strong> Se envió por correo</p>
              </div>

              <button className="btn-primary" onClick={onClose}>
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default BookingModal

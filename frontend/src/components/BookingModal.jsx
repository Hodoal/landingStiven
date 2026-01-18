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
  const [allSlots, setAllSlots] = useState([]) // Nuevo: todos los slots del día
  const [consultantId, setConsultantId] = useState(null)

  useEffect(() => {
    // Cargar primer consultor disponible
    loadDefaultConsultant()
    
    // Limpiar el textarea cuando se monta el componente
    const textarea = document.querySelector('textarea[name="message"]')
    if (textarea) {
      textarea.value = ''
    }
  }, [])

  const loadDefaultConsultant = async () => {
    try {
      const response = await axios.get('/api/consultants')
      if (response.data && response.data.length > 0) {
        setConsultantId(response.data[0]._id || response.data[0].id)
      }
    } catch (error) {
      console.error('Error loading consultants:', error)
    }
  }

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
      if (consultantId) {
        // Convertir fecha a formato local (no UTC) YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const localDateString = `${year}-${month}-${day}`
        
        const response = await axios.get(`/api/consultants/${consultantId}/available-times`, {
          params: { date: localDateString, duration: 60 }
        })
        
        // Obtener datos del response mejorado
        const availableTimes = response.data.availableTimes || []
        const occupiedTimes = response.data.occupiedTimes || []
        const allSlots = response.data.allSlots || [] // TODOS los slots
        
        setAvailableTimes(availableTimes)
        setBookedSlots(occupiedTimes)
        setAllSlots(allSlots)
        
        console.log('✅ Horarios disponibles:', availableTimes.length)
        console.log('❌ Horarios ocupados:', occupiedTimes.length)
        console.log('📊 Total de slots:', allSlots.length)
        console.log('Detalles:', {
          disponibles: availableTimes.map(s => s.startTime),
          ocupados: occupiedTimes.map(s => s.startTime)
        })
      } else {
        // Fallback al endpoint antiguo si no hay consultantId
        const response = await axios.get(`/api/booking/available-times`, {
          params: { date: date.toISOString().split('T')[0] }
        })
        setAvailableTimes(response.data.times || generateTimeSlots())
        setBookedSlots(response.data.bookedSlots || [])
      }
    } catch (error) {
      console.error('Error fetching available times:', error)
      setAvailableTimes([])
      setBookedSlots([])
      setAllSlots([])
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
      // Convertir fecha a formato local (no UTC) YYYY-MM-DD
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`
      
      const response = await axios.post('/api/booking/create', {
        ...formData,
        date: localDateString,
        time: selectedTime,
        consultantId: consultantId // Agregar consultantId
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
                  <h3>
                    Horarios disponibles: {selectedDate.toLocaleDateString('es-ES')}
                    {availableTimes.length > 0 && (
                      <span className="availability-count">
                        {availableTimes.length} disponible{availableTimes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  
                  {/* Mostrar leyenda de colores */}
                  <div className="time-legend">
                    <div className="legend-item">
                      <div className="legend-color available"></div>
                      <span>Disponible</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color occupied"></div>
                      <span>Ocupado</span>
                    </div>
                  </div>

                  {/* Si tenemos allSlots, mostrar vista completa. Si no, mostrar solo disponibles */}
                  {availableTimes && availableTimes.length > 0 ? (
                    <div className="slots-grid">
                      {availableTimes.map((slot, index) => {
                        const time = typeof slot === 'string' ? slot : slot.startTime
                        const isSelected = selectedTime === time
                        return (
                          <button
                            key={`${time}-${index}`}
                            className={`time-slot available-slot ${isSelected ? 'active' : ''}`}
                            onClick={() => handleTimeSelect(time)}
                            title="Horario disponible - Haz clic para seleccionar"
                          >
                            <FiClock size={16} />
                            <span>{time}</span>
                            <span className="slot-status available">✓</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : loading ? (
                    <p className="loading-times">Cargando horarios...</p>
                  ) : (
                    <p className="no-availability">
                      ❌ No hay horarios disponibles para esta fecha
                      {bookedSlots.length > 0 && ` (${bookedSlots.length} horarios ocupados)`}
                    </p>
                  )}

                  {/* Mostrar horarios ocupados */}
                  {bookedSlots.length > 0 && (
                    <div className="booked-slots-info">
                      <p className="booked-title">Horarios ocupados:</p>
                      <div className="booked-slots-list">
                        {bookedSlots.map((slot, index) => (
                          <div key={index} className="booked-slot-item">
                            <span className="booked-time">{slot.startTime}</span>
                            <span className="booked-client">({slot.clientName})</span>
                          </div>
                        ))}
                      </div>
                    </div>
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

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import axios from 'axios'
import { API_ENDPOINTS } from '../utils/api'
import './PilotApplicationModal.css'

function PilotApplicationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    is_labor_lawyer: null,
    works_quota_litis: null,
    monthly_consultations: null,
    willing_to_invest_ads: null,
    ads_budget_range: null,
    main_problem: [],
    full_name: '',
    email: '',
    phone: '',
  })

  const [disqualificationMessage, setDisqualificationMessage] = useState(null)
  const [qualificationResult, setQualificationResult] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const questions = [
    {
      step: 1,
      field: 'is_labor_lawyer',
      title: '¿Ejerce actualmente como abogado laboral en Colombia?',
      type: 'binary',
      options: ['Sí', 'No'],
      critical: true,
    },
    {
      step: 2,
      field: 'works_quota_litis',
      title: '¿Trabaja principalmente bajo el modelo de cuota de litis?',
      type: 'single',
      options: ['Sí', 'Parcialmente', 'No'],
      critical: false,
    },
    {
      step: 3,
      field: 'monthly_consultations',
      title: '¿Cuántas consultas laborales recibe aproximadamente al mes?',
      type: 'single',
      options: ['0–10', '10–30', '30–60', '60+'],
      critical: true,
    },
    {
      step: 4,
      field: 'willing_to_invest_ads',
      title: '¿Está dispuesto a invertir en publicidad para generar casos laborales de forma constante?',
      type: 'binary',
      options: ['Sí', 'No'],
      critical: true,
    },
    {
      step: 5,
      field: 'ads_budget_range',
      title: '¿Qué presupuesto mensual podría destinar exclusivamente a publicidad (Meta Ads), aparte de los honorarios del servicio?',
      type: 'single',
      options: ['Menos de $1.000.000', '$1.000.000 – $2.000.000', '$2.000.000 – $4.000.000', 'Más de $4.000.000'],
      critical: true,
    },
    {
      step: 6,
      field: 'main_problem',
      title: '¿Cuál es su mayor problema con esas consultas?',
      type: 'multiple',
      options: ['Muchas no califican', 'Empresas sin capacidad de pago', 'Casos de cuantía muy baja', 'Falta de tiempo para evaluarlas', 'Otro problema operativo'],
      critical: false,
    },
    {
      step: 7,
      field: 'personal_data',
      title: 'Cuéntanos un poco de ti',
      type: 'form',
      fields: [
        { name: 'full_name', label: 'Nombre completo', type: 'text', required: true },
        { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
        { name: 'phone', label: 'Teléfono', type: 'tel', required: true },
      ],
      critical: false,
    },
  ]

  const currentQuestion = questions.find(q => q.step === step)

  const handleOptionClick = (value) => {
    if (currentQuestion.type === 'multiple') {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.field]: prev[currentQuestion.field].includes(value)
          ? prev[currentQuestion.field].filter(item => item !== value)
          : [...prev[currentQuestion.field], value],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.field]: value,
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNext = async () => {
    setError(null)

    // Validate current question
    if (currentQuestion.type === 'binary' || currentQuestion.type === 'single') {
      if (formData[currentQuestion.field] === null) {
        setError('Por favor selecciona una opción')
        return
      }
    } else if (currentQuestion.type === 'multiple') {
      if (formData[currentQuestion.field].length === 0) {
        setError('Por favor selecciona al menos una opción')
        return
      }
    } else if (currentQuestion.type === 'form') {
      if (!formData.full_name || !formData.email || !formData.phone) {
        setError('Por favor completa todos los campos')
        return
      }
      if (!formData.email.includes('@')) {
        setError('Por favor ingresa un correo válido')
        return
      }
    }

    if (step < 7) {
      setStep(step + 1)
    } else {
      // Final submission - validate after collecting all data
      await validateAndSubmit()
    }
  }

  const validateAndSubmit = async () => {
    setLoading(true)
    try {
      // Check disqualification rules
      const disqualificationReasons = []

      if (formData.is_labor_lawyer === 'No' || formData.is_labor_lawyer === false) {
        disqualificationReasons.push('Not a labor lawyer')
      }

      if (formData.monthly_consultations === '0–10') {
        disqualificationReasons.push('Monthly consultations too low')
      }

      if (formData.willing_to_invest_ads === 'No' || formData.willing_to_invest_ads === false) {
        disqualificationReasons.push('Not willing to invest in ads')
      }

      if (formData.ads_budget_range === 'Menos de $1.000.000') {
        disqualificationReasons.push('Ads budget too low')
      }

      const isDisqualified = disqualificationReasons.length > 0

      // Classify lead
      let lead_type = null
      if (formData.monthly_consultations === '10–30' || formData.monthly_consultations === '30–60') {
        lead_type = 'Ideal'
      } else if (formData.monthly_consultations === '60+') {
        lead_type = 'Scale'
      }

      if (isDisqualified) {
        // Show disqualification message
        setQualificationResult({
          qualified: false,
          lead_type: null,
          leadId: null,
        })
        trackEvent('form_disqualified')
      } else {
        // Qualified - save first, then show calendar
        const response = await axios.post(API_ENDPOINTS.APPLY_PILOT, formData)
        setQualificationResult({
          qualified: true,
          lead_type: response.data.lead_type,
          leadId: response.data.leadId,
        })
        setShowCalendar(true)
        trackEvent('form_submitted')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Por favor selecciona fecha y hora')
      return
    }

    setLoading(true)
    try {
      // Save schedule
      const leadsBaseUrl = API_ENDPOINTS.APPLY_PILOT.replace('/apply-pilot', '')
      const scheduleResponse = await axios.put(
        `${leadsBaseUrl}/update-schedule/${qualificationResult.leadId}`,
        {
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
        }
      )

      trackEvent('schedule_completed')
      handleClose()
      alert('¡Cita agendada exitosamente! Pronto nos pondremos en contacto contigo.')
    } catch (err) {
      console.error('Error:', err)
      setError('Error al agendar la cita. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisqualifiedClose = async () => {
    // Guardar lead como disqualified pero con los datos
    try {
      await axios.post(API_ENDPOINTS.APPLY_PILOT, formData)
    } catch (err) {
      console.log('Error guardando disqualified:', err)
    }
    handleClose()
  }

  const trackEvent = (eventName) => {
    // Send tracking event
    if (window.fbq) {
      window.fbq('track', eventName)
    }
    // Also send to backend for analytics
    axios.post(API_ENDPOINTS.TRACK_EVENT, { eventName }).catch(err => console.error('Tracking error:', err))
  }

  const handlePrevious = () => {
    if (step > 1 && !showCalendar && !qualificationResult) {
      setStep(step - 1)
    }
  }

  const handleClose = () => {
    setDisqualificationMessage(null)
    setQualificationResult(null)
    setShowCalendar(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setStep(1)
    setFormData({
      is_labor_lawyer: null,
      works_quota_litis: null,
      monthly_consultations: null,
      willing_to_invest_ads: null,
      ads_budget_range: null,
      main_problem: [],
      full_name: '',
      email: '',
      phone: '',
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pilot-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="pilot-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* DISQUALIFIED MESSAGE */}
            {qualificationResult && !qualificationResult.qualified ? (
              <div className="disqualification-container">
                <FiAlertCircle size={48} className="disqualification-icon" />
                <h3>No calificas para esta fase</h3>
                <p>
                  Gracias por aplicar. Actualmente este programa está enfocado en abogados laborales con estructura de
                  crecimiento y disposición para invertir en captación.
                </p>
                <p className="secondary-text">
                  Tus datos serán visibles en nuestra página de admin y si abrimos nuevas plazas, nos pondremos en
                  contacto contigo.
                </p>
                <button className="close-btn" onClick={handleDisqualifiedClose}>
                  Cerrar
                </button>
              </div>
            ) : showCalendar && qualificationResult && qualificationResult.qualified ? (
              <>
                <div className="modal-header">
                  <h2>¡Felicidades! 🎉</h2>
                  <button className="close-icon-btn" onClick={handleClose}>
                    <FiX size={24} />
                  </button>
                </div>

                <div className="modal-content">
                  <p className="success-message">Calificas para la prueba piloto. Eres un lead tipo: {qualificationResult.lead_type}</p>

                  <h3>Selecciona el día y hora para tu llamada inicial</h3>

                  <div className="calendar-section">
                    <div className="form-group">
                      <label>Fecha</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>Hora</label>
                      <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
                        <option value="">Selecciona una hora</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button className="btn-secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleScheduleSubmit} disabled={loading}>
                    {loading ? 'Agendando...' : 'Agendar cita'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Aplicar a la Prueba Piloto</h2>
                  <button className="close-icon-btn" onClick={handleClose}>
                    <FiX size={24} />
                  </button>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }}></div>
                </div>

                <div className="modal-content">
                  <div className="question-number">Pregunta {step} de 7</div>
                  <h3 className="question-title">{currentQuestion?.title}</h3>

                  {currentQuestion?.type === 'form' ? (
                    <div className="form-fields">
                      {currentQuestion?.fields?.map((field, idx) => (
                        <div key={idx} className="form-group">
                          <label>{field.label}</label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            placeholder={field.label}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="options-container">
                      {currentQuestion?.options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          className={`option-button ${
                            currentQuestion.type === 'multiple'
                              ? formData[currentQuestion.field]?.includes(option)
                                ? 'selected'
                                : ''
                              : formData[currentQuestion.field] === option
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => handleOptionClick(option)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="option-checkbox">
                            {currentQuestion.type === 'multiple'
                              ? formData[currentQuestion.field]?.includes(option) && <FiCheck size={18} />
                              : formData[currentQuestion.field] === option && <FiCheck size={18} />}
                          </div>
                          <span>{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button className="btn-secondary" onClick={handlePrevious} disabled={step === 1 || loading}>
                    Anterior
                  </button>
                  <button className="btn-primary" onClick={handleNext} disabled={loading}>
                    {loading ? 'Procesando...' : step === 7 ? 'Enviar' : 'Siguiente'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PilotApplicationModal

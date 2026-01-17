import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import axios from 'axios'
import GoogleCalendarScheduler from './GoogleCalendarScheduler'
import MinimalCalendar from './MinimalCalendar'
import SuccessConfetti from './SuccessConfetti'
import './PilotApplicationModal.css'

export default function PilotApplicationModal({ onClose }) {
  const [step, setStep] = useState(0)
  const [responses, setResponses] = useState({})
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [qualificationResult, setQualificationResult] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  // 6 PREGUNTAS ORIGINALES
  const questions = [
    {
      id: 'is_labor_lawyer',
      number: 1,
      question: '¿Eres abogado laboralista?',
      type: 'binary',
      options: [
        { label: 'Sí', value: 'Sí' },
        { label: 'No', value: 'No' }
      ],
      disqualifyIf: 'No'
    },
    {
      id: 'works_quota_litis',
      number: 2,
      question: '¿Trabajas con cuota litis?',
      type: 'single',
      options: [
        { label: 'Sí', value: 'Sí' },
        { label: 'Parcialmente', value: 'Parcialmente' },
        { label: 'No', value: 'No' }
      ]
    },
    {
      id: 'monthly_consultations',
      number: 3,
      question: '¿Cuántas consultas mensuales recibes?',
      type: 'single',
      options: [
        { label: '0–10', value: '0–10' },
        { label: '10–30', value: '10–30' },
        { label: '30–60', value: '30–60' },
        { label: '60+', value: '60+' }
      ],
      disqualifyIf: '0–10'
    },
    {
      id: 'willing_to_invest_ads',
      number: 4,
      question: '¿Estás dispuesto a invertir en publicidad digital?',
      type: 'binary',
      options: [
        { label: 'Sí', value: 'Sí' },
        { label: 'No', value: 'No' }
      ],
      disqualifyIf: 'No'
    },
    {
      id: 'ads_budget_range',
      number: 5,
      question: '¿Cuál es tu presupuesto mensual para publicidad?',
      type: 'single',
      options: [
        { label: 'Menos de $1.000.000', value: 'Menos de $1.000.000' },
        { label: '$1.000.000 - $2.000.000', value: '$1.000.000 - $2.000.000' },
        { label: '$2.000.000 - $4.000.000', value: '$2.000.000 - $4.000.000' },
        { label: 'Más de $4.000.000', value: 'Más de $4.000.000' }
      ],
      disqualifyIf: 'Menos de $1.000.000'
    },
    {
      id: 'main_problem',
      number: 6,
      question: '¿Cuál es su mayor problema con esas consultas?',
      type: 'multiple',
      options: [
        { label: 'Muchas no califican', value: 'Muchas no califican' },
        { label: 'Empresas sin capacidad de pago', value: 'Empresas sin capacidad de pago' },
        { label: 'Casos de cuantía muy baja', value: 'Casos de cuantía muy baja' },
        { label: 'Falta de tiempo para evaluarlas', value: 'Falta de tiempo para evaluarlas' },
        { label: 'Otro problema operativo', value: 'Otro problema operativo' }
      ]
    }
  ]

  const currentQuestion = questions[step]
  const totalSteps = questions.length + 1

  const handleOptionSelect = (value, questionId) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleMultipleSelect = (value) => {
    setResponses(prev => {
      const current = prev.main_problem || []
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, main_problem: newValues }
    })
  }

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else if (step === questions.length - 1) {
      setStep(questions.length)
    } else {
      checkQualification()
    }
  }

  const checkQualification = () => {
    // Verificar si califica basado en respuestas
    const disqualifyingAnswers = {
      is_labor_lawyer: 'No',
      monthly_consultations: '0–10',
      willing_to_invest_ads: 'No',
      ads_budget_range: 'Menos de $1.000.000'
    }

    for (const [key, disqualifyValue] of Object.entries(disqualifyingAnswers)) {
      if (responses[key] === disqualifyValue) {
        setQualificationResult('disqualified')
        return
      }
    }

    setQualificationResult('qualified')
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        ...responses,
        main_problem: responses.main_problem || [],
        ...formData
      }

      const response = await axios.post('/api/leads/apply-pilot', payload)

      if (response.data.disqualified) {
        setQualificationResult('disqualified')
      } else {
        setStep('success')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Hubo un error al enviar el formulario. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = ((step / totalSteps) * 100)
  const canGoPrev = step > 0
  const hasAnsweredCurrent = currentQuestion ? responses[currentQuestion.id] !== undefined : false
  const canGoNext = hasAnsweredCurrent && !qualificationResult

  return (
    <>
      {step === 'success' ? (
        <SuccessConfetti
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          formData={formData}
        />
      ) : (
        <motion.div
          className="pilot-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
      <motion.div
        className="pilot-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Solicitud piloto de 30 días</h2>
            <span className="step-indicator">
            </span>
          </div>
          <button className="close-icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* CONTENIDO */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="modal-content"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* PREGUNTAS */}
            {step < questions.length && !qualificationResult && (
              <div className="question-card">
                <span className="question-number">Pregunta {currentQuestion.number}/6</span>
                <h3 className="question-title">{currentQuestion.question}</h3>

                <div className="options-container">
                  {currentQuestion.type === 'binary' && (
                    <div className="options-binary">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.value}
                          className={`option-button ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
                          onClick={() => handleOptionSelect(option.value, currentQuestion.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'single' && currentQuestion.options.length > 2 && (
                    <select
                      value={responses[currentQuestion.id] || ''}
                      onChange={(e) => handleOptionSelect(e.target.value, currentQuestion.id)}
                      className="options-dropdown"
                    >
                      <option value="">Selecciona una opción</option>
                      {currentQuestion.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {currentQuestion.type === 'single' && currentQuestion.options.length <= 2 && (
                    <div className="options-single">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.value}
                          className={`option-button ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
                          onClick={() => handleOptionSelect(option.value, currentQuestion.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'multiple' && (
                    <div className="options-multiple">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.value}
                          className={`option-button checkbox ${(responses.main_problem || []).includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleMultipleSelect(option.value)}
                        >
                          <div className="option-checkbox">
                            {(responses.main_problem || []).includes(option.value) && '✓'}
                          </div>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FORMULARIO */}
            {step === questions.length && !qualificationResult && (
              <div className="form-card">
                <h3>Información Final</h3>
                <div className="form-fields">
                  <div className="form-group">
                    <label htmlFor="name">Nombre *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Teléfono *</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+57 3XX XXXXXXX"
                    />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
              </div>
            )}

            {/* DISQUALIFIED AFTER FORM */}
            {qualificationResult === 'disqualified' && (
              <div className="disqualification-container">
                <FiAlertCircle className="disqualification-icon" />
                <h3>No calificas en este momento</h3>
                <p>
                  Gracias por tu interés en nuestro programa piloto.
                  {'\n\n'}
                  Según tus respuestas, actualmente no calificas para participar.
                  {'\n\n'}
                  Te recomendamos que intentes de nuevo cuando tengas más consultas mensuales o un presupuesto mayor para publicidad.
                </p>
              </div>
            )}

            {/* CALENDAR FOR QUALIFIED */}
            {qualificationResult === 'qualified' && (
              <div className="calendar-container">
                <h3>Solicita tu reunión</h3>
                <p>Selecciona fecha y hora disponible</p>
                
                <MinimalCalendar 
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
                
                {selectedDate && (
                  <div className="time-selection">
                    <label>Selecciona hora:</label>
                    <div className="time-grid">
                      {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* FOOTER */}
        <div className="modal-footer">
          {!qualificationResult && step !== 'success' && (
            <>
              <button
                className="btn-secondary"
                onClick={handlePrev}
                disabled={!canGoPrev}
              >
                Anterior
              </button>
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!canGoNext && step < questions.length}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '...' : step === questions.length ? 'Enviar' : 'Siguiente'}
              </button>
            </>
          )}

          {(qualificationResult || step === 'success') && (
            <>
              {qualificationResult === 'qualified' && selectedDate && selectedTime && (
                <button
                  className="btn-primary full-width"
                  onClick={() => setStep('success')}
                  style={{ opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? '...' : 'Confirmar Reunión'}
                </button>
              )}
              {qualificationResult === 'disqualified' && (
                <button
                  className="btn-secondary full-width"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
      )}
    </>
  )
}

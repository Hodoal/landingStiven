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
  })

  const [disqualificationMessage, setDisqualificationMessage] = useState(null)

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
      // Auto-check for disqualification
      checkDisqualification(currentQuestion.field, value)
    }
  }

  const checkDisqualification = (field, value) => {
    // is_labor_lawyer = No
    if (field === 'is_labor_lawyer' && value === 'No') {
      showDisqualification()
      return
    }
    // monthly_consultations = 0–10
    if (field === 'monthly_consultations' && value === '0–10') {
      showDisqualification()
      return
    }
    // willing_to_invest_ads = No
    if (field === 'willing_to_invest_ads' && value === 'No') {
      showDisqualification()
      return
    }
    // ads_budget_range < 1M
    if (field === 'ads_budget_range' && value === 'Menos de $1.000.000') {
      showDisqualification()
      return
    }
  }

  const showDisqualification = () => {
    setDisqualificationMessage(
      'Gracias por aplicar.\n\nActualmente este programa está enfocado en abogados laborales con estructura de crecimiento y disposición para invertir en captación.\n\nSi abrimos nuevas plazas, lo contactaremos.'
    )
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
    }

    if (step < 6) {
      setStep(step + 1)
    } else {
      // Final submission
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Send to backend
      const response = await axios.post(API_ENDPOINTS.APPLY_PILOT, formData)

      if (response.data.disqualified) {
        // Save as disqualified
        trackEvent('form_disqualified')
        setDisqualificationMessage(
          'Gracias por aplicar.\n\nActualmente este programa está enfocado en abogados laborales con estructura de crecimiento y disposición para invertir en captación.\n\nSi abrimos nuevas plazas, lo contactaremos.'
        )
      } else {
        // Qualified lead
        trackEvent('form_submitted')
        trackEvent('schedule_completed')
        // Redirect to schedule (después implementaremos esto)
        console.log('Lead calificado:', response.data)
        // Por ahora mostramos mensaje de éxito
        handleClose()
        alert('¡Gracias por aplicar! Pronto nos pondremos en contacto contigo.')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleClose = () => {
    setDisqualificationMessage(null)
    setStep(1)
    setFormData({
      is_labor_lawyer: null,
      works_quota_litis: null,
      monthly_consultations: null,
      willing_to_invest_ads: null,
      ads_budget_range: null,
      main_problem: [],
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
            {disqualificationMessage ? (
              <div className="disqualification-container">
                <FiAlertCircle size={48} className="disqualification-icon" />
                <h3>No calificas para esta fase</h3>
                <p>{disqualificationMessage}</p>
                <button className="close-btn" onClick={handleClose}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Aplicar a la Prueba Piloto</h2>
                  <button className="close-icon-btn" onClick={handleClose}>
                    <FiX size={24} />
                  </button>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(step / 6) * 100}%` }}></div>
                </div>

                <div className="modal-content">
                  <div className="question-number">Pregunta {step} de 6</div>
                  <h3 className="question-title">{currentQuestion?.title}</h3>

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

                  {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={handlePrevious}
                    disabled={step === 1 || loading}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : step === 6 ? 'Enviar' : 'Siguiente'}
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

import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'
import './HowItWorks.css'

function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const steps = [
    {
      number: '1',
      title: 'Paso 1 – Atracción específica',
      description: 'Anuncios dirigidos exclusivamente a:',
      items: [
        'Despido sin justa causa',
        'Indemnizaciones laborales',
        'Contrato realidad',
      ],
      subtitle: 'Nada genérico. Nada curioso.',
    },
    {
      number: '2',
      title: 'Paso 2 – Pre-calificación automática',
      description: 'Antes de llegar a su agenda, cada persona responde:',
      items: [
        'Tipo de empresa (formal / capacidad de pago)',
        'Salario aproximado',
        'Tiempo laborado',
        'Motivo del despido',
      ],
      positive: 'Si cumple → pasa a evaluación',
      negative: 'Si no cumple → no agenda',
    },
    {
      number: '3',
      title: 'Paso 3 – Agenda limpia',
      description: 'Recibirás:',
      items: [
        'Evaluaciones reales',
        'Personas que entienden que hay dinero en juego',
        'Menos desgaste operativo',
      ],
    },
  ]

  return (
    <section className="how-it-works" id="proceso">
      <motion.div
        className="how-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2 variants={itemVariants} className="how-title">
          ¿Cómo funciona?
        </motion.h2>

        <motion.div variants={itemVariants} className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step-card"
              variants={itemVariants}
              whileHover={{ borderColor: '#7c3aed', scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-header">
                <h3 className="step-title">{step.title}</h3>
              </div>

              <p className="step-description">{step.description}</p>

              <ul className="step-items">
                {step.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="step-item">
                    <FiCheck className="step-check-icon" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {step.subtitle && (
                <p className="step-subtitle">{step.subtitle}</p>
              )}

              {step.number === '2' && (
                <div className="step-conditions">
                  <p className="condition negative">{step.negative}</p>
                  <p className="condition positive">{step.positive}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HowItWorks

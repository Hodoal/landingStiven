import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiDollarSign, FiClipboard } from 'react-icons/fi'
import { AiFillStar } from 'react-icons/ai'
import './Promise.css'
import Logo from './Logo'

function Promise({ onBookClick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const whyPoints = [
    'Está diseñado según cómo los abogados aceptan casos',
    'Filtra por capacidad de pago, no solo intención',
    'Prioriza rentabilidad, no volumen vacío',
    'Se enfoca en ahorrar tiempo, no en inflar métricas',
  ]

  const pilotPoints = [
    'Implementación completa del sistema',
    'Optimización durante el piloto',
    'Facebook e Instagram Ads + filtros + agenda',
  ]

  return (
    <section className="promise" id="resultados">
      <motion.div
        className="promise-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2 variants={itemVariants} className="promise-title">
          ¿Por que este sistema funciona?
        </motion.h2>

        <motion.div
          variants={itemVariants}
          className="promise-card why-card"
          whileHover={{ borderColor: '#7c3aed', scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <ul className="why-list">
            {whyPoints.map((point, index) => (
              <li key={index} className="why-item">
                <FiCheck className="check-icon" size={24} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="promise-stars">
          <AiFillStar className="star-icon" size={28} />
          <AiFillStar className="star-icon" size={28} />
          <AiFillStar className="star-icon" size={28} />
          <AiFillStar className="star-icon" size={28} />
          <AiFillStar className="star-icon" size={28} />
        </motion.div>

        <motion.p variants={itemVariants} className="promise-conclusion">
          <span className="conclusion-highlight">Esto no es Marketing Genérico.</span> Es lógica de negocio legal aplicada a captación!
        </motion.p>

        <motion.button
          variants={itemVariants}
          className="promise-cta"
          onClick={onBookClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Aplicar al piloto de 30 días
        </motion.button>

        <motion.h3 variants={itemVariants} className="promise-subtitle">
          Como comenzamos
        </motion.h3>

        <motion.p variants={itemVariants} className="promise-message">
          No hay contratos largos ni promesas irreales.
        </motion.p>

        <motion.p variants={itemVariants} className="pilot-label">
          Programa piloto - 30 días
        </motion.p>

        <motion.div variants={itemVariants} className="pilot-points">
          {pilotPoints.map((point, index) => (
            <div key={index} className="pilot-item">
              <FiCheck className="pilot-check-icon" size={20} />
              <span>{point}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="pilot-details">
          <div className="detail-item">
            <FiDollarSign className="detail-icon" size={24} />
            <span className="detail-text investment-value">Inversión: $1.500.000 COP</span>
          </div>
          <div className="detail-item">
            <FiClipboard className="detail-icon" size={24} />
            <span className="detail-text">Presupuesto de pauta aparte</span>
          </div>
        </motion.div>

        <motion.h4 variants={itemVariants} className="promise-guarantee">
          Garantía del Piloto
        </motion.h4>

        <motion.div variants={itemVariants} className="promise-guarantee-section">


          <motion.h3 variants={itemVariants} className="promise-guarantee-title">
            Si en 30 días no agendamos al menos 15 evaluaciones que cumplan los criterios acordados, extendemos el piloto 30 días sin costo.
          </motion.h3>

          <motion.div variants={itemVariants} className="guarantee-features">
            <div className="guarantee-feature">
              <span className="feature-text no-devolutions">Sin devoluciones</span>
            </div>
            <div className="guarantee-feature">
              <span className="feature-text no-small-print">Sin letra pequeña</span>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            className="promise-cta"
            onClick={onBookClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Aplicar al piloto de 30 días
          </motion.button>

          <motion.div variants={itemVariants} className="promise-footer">
            <Logo />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Promise

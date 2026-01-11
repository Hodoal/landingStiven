import React from 'react'
import { motion } from 'framer-motion'
import './Solution.css'

function Solution({ onBookClick }) {
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

  return (
    <section className="solution" id="solucion">
      <motion.div
        className="solution-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div variants={itemVariants} className="solution-header">
          <p className="solution-intro">Más leads no solucionan esto.</p>
          <h2 className="solution-title">Mejores Filtros, sí.</h2>
        </motion.div>

        <motion.button
          variants={itemVariants}
          className="solution-cta-top"
          onClick={onBookClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Aplicar al piloto de 30 días
        </motion.button>

        <motion.div variants={itemVariants} className="solution-message">
          <p className="no-leads">No vendemos leads.</p>
          <p className="solution-value">
            Vendemos evaluaciones de caso que valen la pena
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="solution-cards">
          <motion.div
            className="solution-card info-card"
            whileHover={{ scale: 1.02, borderColor: '#7c3aed' }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-icon">▲</div>
            <p className="card-description">
              Instalamos un <span className="highlight">Sistema de Pre-Calificación de Demandas Laborales</span> que solo agenda evaluaciones cuando el caso cumple criterios técnicos y financieros reales.
            </p>
          </motion.div>

          <motion.div
            className="solution-card clients-card"
            whileHover={{ scale: 1.02, borderColor: '#fbbf24' }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-icon">▲</div>
            <div className="clients-content">
              <p className="clients-number">+20 clientes</p>
              <p className="clients-description">
                Usted se enfoca en litigar. El sistema filtra el ruido.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          className="solution-cta-bottom"
          onClick={onBookClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Aplicar al piloto de 30 días
        </motion.button>
      </motion.div>
    </section>
  )
}

export default Solution

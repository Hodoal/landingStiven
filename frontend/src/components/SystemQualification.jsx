import React from 'react'
import { motion } from 'framer-motion'
import { MdCheckCircle, MdCancel } from 'react-icons/md'
import { FiCheck, FiX } from 'react-icons/fi'
import './SystemQualification.css'

function SystemQualification({ onBookClick }) {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const forItems = [
    'Abogado laboral enfocado en despidos e indemnizaciones',
    'Trabaja bajo cuota de litis',
    'Necesita volumen constante, pero solo casos cobrables',
    'Quiere dejar de perder tiempo evaluando consultas malas',
  ]

  const notForItems = [
    'Abogados que solo trabajan por referidos',
    'Quien no quiera invertir en marketing',
    'Quien toma cualquier caso "a ver qué pasa"',
  ]

  return (
    <section className="system-qualification" id="beneficios">
      <motion.div
        className="qualification-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2 variants={itemVariants} className="qualification-title">
          Este Sistema Es Para Ti Si...
        </motion.h2>

        <motion.div variants={itemVariants} className="qualification-grid">
          <div className="qualification-card for-card">
            <div className="card-header">
              <MdCheckCircle size={32} className="check-icon" />
              <h3>ES PARA:</h3>
            </div>
            <ul className="qualification-list">
              {forItems.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="list-item"
                >
                  <FiCheck className="list-icon-check" size={20} />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="qualification-card not-card">
            <div className="card-header">
              <MdCancel size={32} className="cancel-icon" />
              <h3>NO ES PARA:</h3>
            </div>
            <ul className="qualification-list">
              {notForItems.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="list-item"
                >
                  <FiX className="list-icon-x" size={20} />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          className="qualification-cta"
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

export default SystemQualification

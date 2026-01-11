import React from 'react'
import { motion } from 'framer-motion'
import './RealProblem.css'

function RealProblem() {
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

  const problems = [
    'La mayoría de las personas que escriben no califican',
    'Muchas empresas no tienen capacidad de pago',
    'Horas perdidas en evaluaciones que no llegan a nada',
    'Casos con cuantía tan baja que no valen el esfuerzo',
  ]

  return (
    <section className="real-problem" id="problemas">
      <motion.div
        className="problem-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2 variants={itemVariants} className="problem-title">
          El verdadero problema no es la falta de consultas
        </motion.h2>

        <motion.div variants={itemVariants} className="problem-subtitle">
          <p className="subtitle-italic">
            La mayoría de abogados laborales no tienen un problema de demanda.
          </p>
          <p className="subtitle-italic">Tienen un problema de calidad.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="problems-grid">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              className="problem-box"
              variants={itemVariants}
              whileHover={{ scale: 1.05, borderColor: '#7c3aed' }}
              transition={{ duration: 0.3 }}
            >
              <p>{problem}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default RealProblem

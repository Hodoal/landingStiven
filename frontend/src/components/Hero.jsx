import React from 'react'
import { motion } from 'framer-motion'
import './Hero.css'

function Hero({ onBookClick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  return (
    <section className="hero">
      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants}>
          Agendamos entre 15 y 20 evaluaciones de caso laboral al mes solo con personas que SÍ califican para una demanda rentable
        </motion.h1>

        <motion.p variants={itemVariants} className="hero-subtitle">
          Sistema De Pre-Calificación Para Abogados Laborales En Colombia.
          <br />
          No Más Consultas Basura. No Más Pérdida De Tiempo.
        </motion.p>

        <motion.button 
          variants={itemVariants}
          className="hero-cta"
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

export default Hero

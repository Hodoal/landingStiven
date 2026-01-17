import React from 'react'
import { motion } from 'framer-motion'
import './CTA.css'

function CTA({ onBookClick }) {
  return (
    <section className="cta">
      <motion.div
        className="cta-container"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          ¿Listo para Transformar tu Negocio?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Agenda tu asesoría gratuita hoy y comienza tu transformación digital
        </motion.p>

        <motion.button
          className="cta-button"
          onClick={onBookClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Aplicar a la prueba piloto
        </motion.button>
      </motion.div>
    </section>
  )
}

export default CTA

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar } from 'react-icons/fi'
import './FloatingButton.css'

function FloatingButton({ onClick }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="floating-button-container">
      <motion.button
        className="floating-button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        <FiCalendar size={32} />
      </motion.button>

      {showTooltip && (
        <motion.div
          className="floating-tooltip"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          ¡Haz clic aquí! 🚀
        </motion.div>
      )}
    </div>
  )
}

export default FloatingButton

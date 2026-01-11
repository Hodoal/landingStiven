import React from 'react'
import { motion } from 'framer-motion'
import { FiZap } from 'react-icons/fi'
import './FloatingButton.css'

function FloatingButton({ onClick }) {
  return (
    <motion.button
      className="floating-button"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <FiZap size={24} />
      <span>Agendar</span>
    </motion.button>
  )
}

export default FloatingButton

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './LegalModal.css';

export default function Privacy() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        className="legal-link"
        onClick={() => setShowModal(true)}
      >
        Privacidad
      </button>

      {showModal && (
        <motion.div
          className="legal-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="legal-modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="legal-close" onClick={() => setShowModal(false)}>
              <FiX size={24} />
            </button>
            <h2>Política de Privacidad</h2>
            <p>Tu privacidad es importante para nosotros. Protegemos tus datos personales con los más altos estándares de seguridad.</p>
            <p>Los datos que recopilamos se utilizan exclusivamente para mejorar nuestros servicios y tu experiencia.</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

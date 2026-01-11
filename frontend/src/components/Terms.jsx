import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './LegalModal.css';

export default function Terms() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        className="legal-link"
        onClick={() => setShowModal(true)}
      >
        Términos
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
            <h2>Términos y Condiciones</h2>
            <p>Al utilizar nuestros servicios, aceptas estos términos y condiciones.</p>
            <p>Nos comprometemos a proporcionar un servicio profesional y de calidad, respetando todos los derechos y obligaciones establecidos.</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

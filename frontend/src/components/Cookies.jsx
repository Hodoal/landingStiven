import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './LegalModal.css';

export default function Cookies() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        className="legal-link"
        onClick={() => setShowModal(true)}
      >
        Cookies
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
            <h2>Política de Cookies</h2>
            <p>Utilizamos cookies para mejorar tu experiencia de navegación y proporcionar un servicio personalizado.</p>
            <p>Las cookies nos permiten recordar tus preferencias y analizar cómo utilizas nuestro sitio para seguir mejorando.</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

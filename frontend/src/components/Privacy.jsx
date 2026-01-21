import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

      <AnimatePresence>
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
              
              <div className="legal-content">
                <h3>1. Responsable de los Datos Personales</h3>
                <p>Stivenads, con domicilio en Colombia, es responsable del tratamiento de sus datos personales de conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013.</p>

                <h3>2. Información que Recopilamos</h3>
                <p>Recopilamos los siguientes datos personales:</p>
                <ul className="legal-list">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Información profesional (especialidad legal, experiencia)</li>
                  <li>Datos de navegación y cookies</li>
                  <li>Información de calificación del sistema</li>
                </ul>

                <h3>3. Propósito del Tratamiento</h3>
                <p>Sus datos serán utilizados para:</p>
                <ul className="legal-list">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Comunicaciones sobre actualizaciones y promociones</li>
                  <li>Análisis de uso y estadísticas</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraude y garantizar la seguridad</li>
                </ul>

                <h3>4. Derechos del Titular de Datos (Ley 1581/2012)</h3>
                <p>Usted tiene derecho a:</p>
                <ul className="legal-list">
                  <li><strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted</li>
                  <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos (derecho al olvido)</li>
                  <li><strong>Revocatoria del consentimiento:</strong> Retirar su autorización en cualquier momento</li>
                  <li><strong>Información:</strong> Ser informado sobre el uso de sus datos</li>
                </ul>

                <h3>5. Compartir Datos con Terceros</h3>
                <p>No compartimos sus datos personales con terceros sin su consentimiento previo, excepto cuando sea requerido por ley o para proveer nuestros servicios.</p>

                <h3>6. Seguridad de los Datos</h3>
                <p>Implementamos medidas técnicas y administrativas para proteger sus datos contra acceso no autorizado, alteración, pérdida o uso indebido.</p>

                <h3>7. Retención de Datos</h3>
                <p>Mantenemos sus datos personales mientras sea necesario para cumplir con los propósitos indicados o mientras lo requiera la ley colombiana.</p>

                <h3>8. Transferencia Internacional</h3>
                <p>Nuestros servidores se encuentran en Colombia. No realizamos transferencias internacionales de datos sin consentimiento previo.</p>

                <h3>9. Contacto para Ejercer Derechos</h3>
                <p>Para ejercer sus derechos de acceso, rectificación, supresión o revocatoria, contacte a:</p>
                <p><strong>Email:</strong> stivenads25@gmail.com</p>
                <p><strong>Teléfono:</strong> +57 300 8729696</p>

                <h3>10. Cambios en la Política</h3>
                <p>Esta política puede ser actualizada. Le notificaremos de cambios significativos mediante correo electrónico.</p>

                <p className="last-update"><em>Última actualización: Enero 2026</em></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

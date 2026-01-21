import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
              
              <h2>Términos y Condiciones</h2>
              
              <div className="legal-content">
                <h3>1. Aceptación de Términos</h3>
                <p>Al acceder y utilizar este sitio web, usted acepta estar vinculado por estos Términos y Condiciones. Si no está de acuerdo, le solicitamos que no utilice nuestros servicios.</p>

                <h3>2. Descripción del Servicio</h3>
                <p>Stivenads proporciona un sistema de pre-calificación para abogados laborales en Colombia, facilitando la conexión con clientes potenciales y gestión de consultas.</p>

                <h3>3. Requisitos de Uso</h3>
                <p>Para utilizar nuestros servicios, usted debe:</p>
                <ul className="legal-list">
                  <li>Ser mayor de 18 años</li>
                  <li>Ser abogado licenciado en Colombia</li>
                  <li>Tener especialidad o experiencia en Derecho Laboral</li>
                  <li>Proporcionar información verdadera y completa</li>
                  <li>Mantener confidencialidad de credenciales de acceso</li>
                </ul>

                <h3>4. Responsabilidades del Usuario</h3>
                <p>Usted es responsable de:</p>
                <ul className="legal-list">
                  <li>Cumplir con todas las leyes aplicables en Colombia</li>
                  <li>No utilizar el servicio para actividades ilícitas</li>
                  <li>Mantener la ética profesional en todas las comunicaciones</li>
                  <li>No compartir o transferir su cuenta a terceros</li>
                  <li>Notificar de cualquier acceso no autorizado</li>
                </ul>

                <h3>5. Propiedad Intelectual</h3>
                <p>Todos los contenidos, diseños, logos y material de este sitio son propiedad de Stivenads y están protegidos por derechos de autor colombianos e internacionales.</p>

                <h3>6. Limitación de Responsabilidad</h3>
                <p>Stivenads no será responsable por:</p>
                <ul className="legal-list">
                  <li>Daños indirectos o consecuentes</li>
                  <li>Pérdida de datos o información</li>
                  <li>Interrupciones del servicio</li>
                  <li>Decisiones profesionales basadas en el sistema</li>
                </ul>

                <h3>7. Modificación del Servicio</h3>
                <p>Stivenads se reserva el derecho de modificar, suspender o descontinuar el servicio en cualquier momento con notificación previa a los usuarios.</p>

                <h3>8. Terminación</h3>
                <p>Podemos terminar o suspender su cuenta si: viola estos términos, realiza actividades ilícitas, o incumple con obligaciones profesionales éticas.</p>

                <h3>9. Ley Aplicable</h3>
                <p>Estos Términos y Condiciones se rigen por las leyes de la República de Colombia, en particular por el Código de Comercio y demás normas aplicables.</p>

                <h3>10. Disputes y Solución de Conflictos</h3>
                <p>Cualquier conflicto será resuelto mediante: negociación directa, mediación, o ante los juzgados competentes de Colombia según corresponda.</p>

                <h3>11. Contacto</h3>
                <p>Para consultas sobre estos términos, contacte a:</p>
                <p><strong>Email:</strong> stivenads25@gmail.com</p>
                <p><strong>Teléfono:</strong> +57 300 8729696</p>

                <p className="last-update"><em>Última actualización: Enero 2026</em></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

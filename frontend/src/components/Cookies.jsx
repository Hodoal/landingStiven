import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
              
              <h2>Política de Cookies</h2>
              
              <div className="legal-content">
                <h3>1. ¿Qué son las Cookies?</h3>
                <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando navega por nuestro sitio web. Permiten mejorar la experiencia de usuario, personalizar contenido y analizar el comportamiento de navegación.</p>

                <h3>2. Tipos de Cookies que Utilizamos</h3>
                
                <h4>Cookies Técnicas/Necesarias</h4>
                <ul className="legal-list">
                  <li>Autenticación y seguridad</li>
                  <li>Preferencias de usuario (idioma, tema)</li>
                  <li>Funcionamiento del carrito de compras</li>
                  <li>Prevención de fraude</li>
                </ul>

                <h4>Cookies de Análisis</h4>
                <ul className="legal-list">
                  <li>Google Analytics - Análisis de tráfico y comportamiento</li>
                  <li>Hotjar - Mapas de calor y grabaciones de sesiones</li>
                  <li>Estadísticas generales de uso del sitio</li>
                </ul>

                <h4>Cookies de Marketing/Publicidad</h4>
                <ul className="legal-list">
                  <li>Facebook Pixel - Seguimiento de conversiones</li>
                  <li>Google Ads - Remarketing y publicidad personalizada</li>
                  <li>LinkedIn Insight Tag - Datos profesionales</li>
                  <li>Publicidad comportamental y retargeting</li>
                </ul>

                <h4>Cookies de Terceros</h4>
                <ul className="legal-list">
                  <li>Proveedores de servicios de comunicación</li>
                  <li>Plataformas de pago (si aplica)</li>
                  <li>Redes sociales (botones de compartir)</li>
                </ul>

                <h3>3. Consentimiento y Aceptación</h3>
                <p>Al hacer clic en "Aceptar" en nuestro banner de cookies o al continuar navegando el sitio, usted acepta el uso de todas las categorías de cookies descritas arriba, de conformidad con la Resolución 2393 de 2011 de la Superintendencia de Industria y Comercio de Colombia.</p>

                <h3>4. Control de Cookies</h3>
                <p>Puede controlar las cookies a través de:</p>
                <ul className="legal-list">
                  <li><strong>Configuración del navegador:</strong> Chrome, Firefox, Safari, Edge tienen opciones para aceptar/rechazar cookies</li>
                  <li><strong>Plataformas de opt-out:</strong> www.aboutads.info, www.youronlinechoices.com</li>
                  <li><strong>Herramientas de privacidad:</strong> Do Not Track (DNT)</li>
                </ul>

                <h3>5. Cookies Esenciales (No se pueden desactivar)</h3>
                <p>Las siguientes cookies son técnicamente necesarias para el funcionamiento del sitio y no pueden ser desactivadas:</p>
                <ul className="legal-list">
                  <li>Cookies de autenticación de sesión</li>
                  <li>Cookies de seguridad</li>
                  <li>Cookies de preferencias de privacidad</li>
                </ul>

                <h3>6. Proveedores de Cookies de Terceros</h3>
                <p><strong>Google Analytics:</strong> Consulte la política de privacidad de Google en www.google.com/policies/privacy</p>
                <p><strong>Facebook:</strong> www.facebook.com/policies/cookies</p>
                <p><strong>LinkedIn:</strong> www.linkedin.com/legal/cookie-policy</p>

                <h3>7. Retención de Cookies</h3>
                <p>Las cookies se almacenan entre 1 día y 2 años, dependiendo de su tipo. Puede eliminar cookies en cualquier momento a través de su navegador.</p>

                <h3>8. Cookies y Menores de Edad</h3>
                <p>Nuestro sitio no está dirigido a menores de 13 años. No recopilamos intencionalmente cookies de menores sin consentimiento parental.</p>

                <h3>9. Actualizaciones de esta Política</h3>
                <p>Actualizamos esta política según cambios en regulaciones (Ley 1581/2012, GDPR, LSSI-CE) y tecnologías. La versión más reciente siempre estará disponible en nuestro sitio.</p>

                <h3>10. Contacto</h3>
                <p>Para preguntas sobre nuestra política de cookies o para revocar su consentimiento:</p>
                <p><strong>Email:</strong> stivenads25@gmail.com</p>
                <p><strong>Teléfono:</strong> +57 300 8729696</p>

                <h3>11. Cumplimiento Legal</h3>
                <p>Esta política cumple con:</p>
                <ul className="legal-list">
                  <li>Ley 1581 de 2012 (Protección de Datos Personales)</li>
                  <li>Decreto 1377 de 2013</li>
                  <li>Resolución 2393 de 2011 (SIC)</li>
                  <li>Reglamento General de Protección de Datos (GDPR)</li>
                </ul>

                <p className="last-update"><em>Última actualización: Enero 2026</em></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React from 'react'
import { FiCheckCircle, FiUser, FiBriefcase, FiSearch, FiUsers, FiAlertCircle } from 'react-icons/fi'
import './AboutStiven.css'

function AboutStiven({ onBookClick }) {
  return (
    <section className="about-stiven">
      <div className="about-header-section">
        <h2>¿Quién soy y por qué confiar en mí?</h2>
      </div>

      <div className="about-container">
        {/* Imagen a la izquierda */}
        <div className="about-image-wrapper">
          <div className="about-image-container">
            <img
              src="/IMG_8666.jpg"
              alt="Stiven Alian - Especialista en operaciones legales"
              className="about-image"
            />
            <div className="about-image-badge">
              <FiUser size={18} />
              <span>5+ años</span>
            </div>
          </div>
        </div>

        {/* Contenido a la derecha */}
        <div className="about-content">
          <div className="about-section">
            <h3><FiUser size={20} /> ¿Quién soy?</h3>
            <p>
              Soy <strong>Stiven Alian</strong>, especialista en operaciones, intake y selección de casos en firmas legales, con <strong>más de 5 años</strong> trabajando en despachos en Estados Unidos.
            </p>
            <div className="highlight-box">
              <p>
                No vengo del marketing tradicional. Vengo de cómo funciona una firma legal por dentro: qué casos se toman, cuáles se descartan y por qué unos generan honorarios y otros solo consumen tiempo.
              </p>
            </div>
          </div>

          <div className="about-section">
            <h3><FiBriefcase size={20} /> Mi experiencia</h3>
            <p>
              He trabajado en firmas de EE.UU. donde filtrar mal cuesta <strong>miles de dólares por caso</strong>:
            </p>
            <ul className="experience-list">
              <li><strong>Personal Injury</strong> - Lesiones personales & Accidentes laborales</li>
              <li><strong>Immigration Law</strong> - Inmigración</li>
              <li><strong>Uninhabitable Living Conditions</strong> - Condiciones de vida inhabitables</li>
            </ul>
            <p>Mi rol: <strong>recibir consultas, filtrar casos y preparar solo los viables.</strong></p>
            <p className="current-role">Eso es exactamente lo que hoy implemento para despachos laborales en Colombia.</p>
          </div>
        </div>

        <div className="about-sections-grid">
          <div className="about-section">
            <h3><FiSearch size={20} /> ¿Por qué importa para tu despacho?</h3>
            <p>El problema no es atraer más consultas, sino:</p>
            <ul className="benefits-list">
              <li><FiCheckCircle size={16} /> Evitar casos sin solvencia</li>
              <li><FiCheckCircle size={16} /> Evitar cuantías bajas</li>
              <li><FiCheckCircle size={16} /> Evitar evaluaciones que nunca se convierten en demanda</li>
            </ul>
            <div className="impact-box">
              <p>
                Yo ya he hecho este trabajo a diario, <strong>bajo presión real, con métricas reales</strong>, en firmas donde: <em>si la admisión falla, la firma pierde dinero.</em>
              </p>
            </div>
          </div>

          <div className="about-section">
            <h3><FiAlertCircle size={20} /> No soy solo marketing</h3>
            <p>También he trabajado en:</p>
            <ul className="skills-list">
              <li>Ventas legales (intake & cierre)</li>
              <li>Gestión de casos</li>
              <li>Optimización de procesos internos</li>
              <li>Publicidad digital (Meta Ads)</li>
            </ul>
            <p>Esto me permite ayudarte a ordenar tu proceso, mejorar el cierre, reducir carga administrativa y enfocarte en tu rol como abogado.</p>
          </div>

          <div className="about-section">
            <h3><FiUsers size={20} /> Cómo trabajo contigo</h3>
            <p><strong>No funciono como una agencia.</strong></p>
            <p>Trabajo como un <strong>aliado operativo</strong> que:</p>
            <ul className="working-list">
              <li>Entiende tu realidad como abogado</li>
              <li>Respeta tu tiempo</li>
              <li>Instala un sistema</li>
              <li>Se enfoca en rentabilidad, no en volumen vacío</li>
            </ul>
          </div>

          <div className="about-section about-section-final">
            <h3>✋ Importante</h3>
            <p><strong>No trabajo con cualquier despacho.</strong></p>
            <p>Este sistema es solo para abogados laborales que:</p>
            <ul className="criteria-list">
              <li>Buscan casos rentables</li>
              <li>Entienden el valor de filtrar</li>
              <li>Quieren crecer con orden</li>
            </ul>
            <p className="process-text"><strong>Por eso el proceso es por aplicación.</strong></p>
            <button
              className="cta-button"
              onClick={onBookClick}
            >
              Aplicar al Piloto de 30 Días
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutStiven

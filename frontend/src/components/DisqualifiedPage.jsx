import React from 'react';
import { FiHeart, FiX } from 'react-icons/fi';
import './DisqualifiedPage.css';

export default function DisqualifiedPage({ onClose }) {
  return (
    <div className="disqualified-overlay" onClick={onClose}>
      <div className="disqualified-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        
        <FiHeart className="disqualified-icon" size={60} />
        
        <h2>No calificas en este momento</h2>
        <p>Nos enfocamos en abogados laboralistas con:</p>
        
        <ul className="requirements">
          <li>10+ consultas mensuales</li>
          <li>Disposición a invertir en ADS</li>
          <li>Presupuesto de inversión</li>
        </ul>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Volver al inicio
          </button>
          <p className="contact-text">
            ¿Tienes dudas? Contáctanos: <a href="mailto:info@stivenads.com">info@stivenads.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

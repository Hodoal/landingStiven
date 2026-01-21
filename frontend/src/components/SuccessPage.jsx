import React, { useEffect } from 'react';
import { FiHeart, FiX } from 'react-icons/fi';
import './SuccessPage.css';
import Fireworks from './Fireworks';

export default function SuccessPage() {
  const [showFireworks, setShowFireworks] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="success-page-container">
      {showFireworks && <Fireworks />}
      
      <div className="success-content">
        <FiHeart className="success-icon" size={80} />
        <h1>¡Gracias por tu interés!</h1>
        <p>Tu solicitud ha sido recibida exitosamente.</p>
        <p className="subtitle">Te contactaremos pronto para agendar tu reunión.</p>
        
        <button 
          className="close-btn"
          onClick={() => window.location.href = '/'}
        >
          <FiX size={20} /> Cerrar
        </button>
      </div>
    </div>
  );
}

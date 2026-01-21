import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './CookiesBanner.css';
import Cookies from './Cookies';

export default function CookiesBanner() {
  const [show, setShow] = useState(false);
  const [showCookiesModal, setShowCookiesModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookiesAccepted')) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiesAcceptedDate', new Date().toISOString());
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookiesRejected', 'true');
    localStorage.setItem('cookiesRejectedDate', new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="cookies-banner">
        <div className="cookies-content">
          <h4>🍪 Gestión de Cookies</h4>
          <p>
            Utilizamos cookies técnicas (necesarias), de análisis (Google Analytics, Hotjar) y marketing (Facebook, LinkedIn) 
            para mejorar tu experiencia. Puedes aceptar todas o configurar tus preferencias.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowCookiesModal(true); }} className="cookies-link">
            Leer política completa
          </a>
        </div>
        <div className="cookies-buttons">
          <button className="btn-reject" onClick={handleReject}>Rechazar</button>
          <button className="main-cta" onClick={handleAccept}>Aceptar Todo</button>
          <button className="btn-close" onClick={() => setShow(false)} title="Cerrar">
            <FiX size={20} />
          </button>
        </div>
      </div>

      {showCookiesModal && (
        <div style={{ position: 'relative', zIndex: 2002 }} onClick={() => setShowCookiesModal(false)}>
          <Cookies />
        </div>
      )}
    </>
  );
}

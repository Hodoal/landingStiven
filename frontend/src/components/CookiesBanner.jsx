import React, { useState, useEffect } from 'react';
import './CookiesBanner.css';

export default function CookiesBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookiesAccepted')) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="cookies-banner">
      <p>
        Utilizamos cookies para mejorar tu experiencia de navegación, analizar el uso del sitio y personalizar el contenido. 
        Al continuar navegando, aceptas el uso de cookies de acuerdo con nuestra Política de Privacidad.
      </p>
      <button className="main-cta" onClick={() => { localStorage.setItem('cookiesAccepted', 'true'); setShow(false); }}>
        Aceptar
      </button>
    </div>
  );
}

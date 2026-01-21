import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './SuccessConfetti.css';

export default function SuccessConfetti({ selectedDate, selectedTime, formData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Create and configure canvas for confetti
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '9998';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;

      const confettiInstance = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });

      // Trigger confetti on mount
      const duration = 3000; // 3 seconds
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 45, 
        spread: 360, 
        ticks: 80, 
        gravity: 1,
        scalar: 1.2,
      };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 100 * (timeLeft / duration);

        confettiInstance(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
            colors: ['#fbbf24', '#1a2844', '#ffffff', '#3a4d6a', '#f59e0b'],
          })
        );
      }, 250);

      return () => {
        clearInterval(interval);
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvasRef.current.parentNode.removeChild(canvasRef.current);
          canvasRef.current = null;
        }
      };
    }
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="success-confetti-container">
      <div className="success-content">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h2 className="success-title">¡Reunión Confirmada!</h2>

        <p className="success-message">
          Gracias por tu interés en nuestro programa piloto.
        </p>

        <div className="booking-details">
          <div className="detail">
            <span className="detail-label">Nombre</span>
            <span className="detail-value">{formData?.name || 'N/A'}</span>
          </div>
          <div className="detail">
            <span className="detail-label">Email</span>
            <span className="detail-value">{formData?.email || 'N/A'}</span>
          </div>
          <div className="detail">
            <span className="detail-label">Fecha</span>
            <span className="detail-value">{formatDate(selectedDate)}</span>
          </div>
          <div className="detail">
            <span className="detail-label">Hora</span>
            <span className="detail-value">{selectedTime}</span>
          </div>
        </div>

        <p className="success-footer">
          Te enviaremos un email con los detalles de la reunión.
        </p>
      </div>
    </div>
  );
}

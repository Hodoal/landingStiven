import React from 'react'
import Privacy from './Privacy'
import Terms from './Terms'
import Cookies from './Cookies'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="faq">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Stivenads</h4>
          <p>Asesorías de marketing para transformar tu negocio</p>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Privacy /></li>
            <li><Terms /></li>
            <li><Cookies /></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: stivenads25@gmail.com</p>
          <p>Teléfono: +57 300 8729696</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Stivenads. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer

import React from 'react'
import './Logo.css'

function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Símbolo de asesoría/negocio */}
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 8v8m0 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="3" fill="currentColor"/>
        </svg>
      </div>
      <span>Stivenads</span>
    </div>
  )
}

export default Logo

import React from 'react'
import { motion } from 'framer-motion'
import './Header.css'
import Logo from './Logo'
import { FiMenu, FiX, FiCalendar } from 'react-icons/fi'
import { useState, useEffect } from 'react'

function Header({ onBookClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [show, setShow] = useState(true)
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      setShow(window.scrollY < 50 || window.scrollY < lastY);
      lastY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header 
      className={`header${show ? ' show' : ' hide'}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-container">
        <Logo />
        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <a href="#problemas" onClick={() => setMenuOpen(false)}>Problema</a>
          <a href="#solucion" onClick={() => setMenuOpen(false)}>Solución</a>
          <a href="#beneficios" onClick={() => setMenuOpen(false)}>Beneficios</a>
          <a href="#proceso" onClick={() => setMenuOpen(false)}>Proceso</a>
          <a href="#resultados" onClick={() => setMenuOpen(false)}>Resultados</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>Preguntas</a>
        </nav>
        <button className="header-btn" onClick={onBookClick}>
          <FiCalendar size={18} />
          <span>Agendar</span>
        </button>
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </motion.header>
  )
}

export default Header

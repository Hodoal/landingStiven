import React from 'react'
import { motion } from 'framer-motion'
import './Header.css'
import Logo from './Logo'
import { FiCalendar } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useFacebookPixel } from '../services/facebookPixel'

function Header({ onBookClick }) {
  const { events: fbEvents } = useFacebookPixel()
  
  const handleClick = () => {
    fbEvents.CTA_CLICK('header', {
      cta_text: 'Aplicar a la prueba piloto'
    })
    onBookClick()
  }
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
        <button className="header-btn" onClick={handleClick}>
          <FiCalendar size={18} />
          <span>Aplicar a la prueba piloto</span>
        </button>
      </div>
    </motion.header>
  )
}

export default Header

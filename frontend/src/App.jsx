import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import SystemQualification from './components/SystemQualification'
import RealProblem from './components/RealProblem'
import Solution from './components/Solution'
import HowItWorks from './components/HowItWorks'
import AboutStiven from './components/AboutStiven'
import Promise from './components/Promise'
import Footer from './components/Footer'
import CookiesBanner from './components/CookiesBanner'
import FloatingButton from './components/FloatingButton'
import PilotApplicationModal from './components/PilotApplicationModal'
import BookingModal from './components/BookingModal'
import AdminPage from './pages/AdminPage'
import './index.css'

function App() {
  const [showPilotModal, setShowPilotModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Check URL for admin page
    if (window.location.pathname === '/admin') {
      setCurrentPage('admin')
    } else {
      setCurrentPage('home')
    }

    // Listen for URL changes
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setCurrentPage('admin')
      } else {
        setCurrentPage('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin')
    setCurrentPage('admin')
  }

  const navigateToHome = () => {
    window.history.pushState(null, '', '/')
    setCurrentPage('home')
  }

  // Resetear scroll al inicio
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setShowFloatingButton(scrollPosition > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (currentPage === 'admin') {
    return <AdminPage onExit={navigateToHome} />
  }

  return (
    <div className="app">
      <Header onBookClick={() => setShowPilotModal(true)} />
      <Hero onBookClick={() => setShowPilotModal(true)} />
      <SystemQualification onBookClick={() => setShowPilotModal(true)} />
      <RealProblem />
      <Solution onBookClick={() => setShowPilotModal(true)} />
      <HowItWorks />
      <AboutStiven onBookClick={() => setShowPilotModal(true)} />
      <Promise onBookClick={() => setShowPilotModal(true)} />
      <Footer />
      <CookiesBanner />
      
      {showFloatingButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <FloatingButton onClick={() => setShowPilotModal(true)} />
        </motion.div>
      )}

      {showPilotModal && <PilotApplicationModal onClose={() => setShowPilotModal(false)} />}
      {showBookingModal && (
        <BookingModal onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  )
}

export default App


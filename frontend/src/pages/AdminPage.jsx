import React, { useState, useEffect } from 'react'
import AdminPanel from '../admin/AdminPanel'
import './AdminPage.css'

function AdminPage({ onExit }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated in this session
    const adminAuth = sessionStorage.getItem('adminAuthenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Simple password check - in production, use proper authentication
    const correctPassword = 'Stiven2025' // Change this to a secure password
    
    if (password === correctPassword) {
      sessionStorage.setItem('adminAuthenticated', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    setIsAuthenticated(false)
    setPassword('')
    if (onExit) onExit()
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h1>Panel de Administración</h1>
          <p>Ingresa la contraseña para acceder</p>
          
          <form onSubmit={handleLogin}>
            <div className="login-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="login-button">
              Acceder
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Administración - Stivenads</h1>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      <AdminPanel />
    </div>
  )
}

export default AdminPage

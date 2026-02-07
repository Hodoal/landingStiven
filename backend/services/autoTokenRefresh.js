const { tokenManager } = require('./tokenManager');

/**
 * Servicio de renovación automática de tokens de Google Calendar
 * Ejecuta checks periódicos y renueva el token antes de que expire
 */
class AutoTokenRefresh {
  constructor() {
    this.refreshInterval = null;
    this.checkIntervalMs = 5 * 60 * 1000; // Check cada 5 minutos
    this.isInitialized = false;
  }

  /**
   * Inicia el servicio de renovación automática
   */
  start() {
    if (this.isInitialized) {
      console.log('⚠️ AutoTokenRefresh: Already initialized');
      return;
    }

    console.log('🚀 AutoTokenRefresh: Starting automatic token refresh service');
    console.log(`   Check interval: ${this.checkIntervalMs / 1000 / 60} minutes`);

    // Realizar un chequeo inicial
    this.checkAndRefresh();

    // Programar chequeos periódicos
    this.refreshInterval = setInterval(() => {
      this.checkAndRefresh();
    }, this.checkIntervalMs);

    this.isInitialized = true;
    console.log('✅ AutoTokenRefresh: Service initialized successfully');
  }

  /**
   * Realiza un chequeo y renueva el token si es necesario
   */
  async checkAndRefresh() {
    try {
      const tokenStatus = tokenManager.getTokenStatus();
      
      console.log('\n📊 AutoTokenRefresh: Periodic token check');
      console.log(`   Current time: ${new Date().toISOString()}`);
      console.log(`   Token valid: ${tokenStatus.isValid}`);
      console.log(`   Token expires at: ${tokenStatus.expiryDateLocal || 'Unknown'}`);
      console.log(`   Time until expiry: ${tokenStatus.timeUntilExpiry ? Math.round(tokenStatus.timeUntilExpiry / 1000 / 60) + ' minutes' : 'Unknown'}`);

      // Si el token no es válido, renovar
      if (!tokenStatus.isValid) {
        console.log('⚠️ AutoTokenRefresh: Token is invalid or expiring soon');
        await this.performRefresh();
      } else {
        console.log('✅ AutoTokenRefresh: Token is still valid');
      }
    } catch (error) {
      console.error('❌ AutoTokenRefresh: Error during periodic check:', error.message);
    }
  }

  /**
   * Realiza la renovación del token
   */
  async performRefresh() {
    try {
      console.log('🔄 AutoTokenRefresh: Attempting to refresh token...');
      const success = await tokenManager.forceRefresh();

      if (success) {
        console.log('✅ AutoTokenRefresh: Token refreshed successfully');
        const newStatus = tokenManager.getTokenStatus();
        console.log(`   New expiry: ${newStatus.expiryDateLocal || 'Unknown'}`);
      } else {
        console.error('❌ AutoTokenRefresh: Token refresh failed');
      }
    } catch (error) {
      console.error('❌ AutoTokenRefresh: Error during token refresh:', error.message);
    }
  }

  /**
   * Detiene el servicio de renovación automática
   */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.isInitialized = false;
      console.log('🛑 AutoTokenRefresh: Service stopped');
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      isRunning: this.refreshInterval !== null,
      checkIntervalMs: this.checkIntervalMs,
      checkIntervalMinutes: this.checkIntervalMs / 1000 / 60
    };
  }
}

// Crear instancia singleton
const autoTokenRefresh = new AutoTokenRefresh();

module.exports = {
  AutoTokenRefresh,
  autoTokenRefresh
};

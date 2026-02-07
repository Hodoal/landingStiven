const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class TokenManager {
  constructor() {
    this.oauth2Client = null;
    this.tokenExpiry = null;
    this.refreshInProgress = false;
    this.initializeClient();
  }

  initializeClient() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if refresh token is available
    if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN !== 'your_google_refresh_token') {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }
  }

  /**
   * Verifica si el token actual es válido y no ha expirado
   * @returns {boolean} true si el token es válido
   */
  isTokenValid() {
    try {
      const credentials = this.oauth2Client.credentials;
      
      // Si no hay credentials, el token no es válido
      if (!credentials) {
        console.log('⚠️ TokenManager: No credentials found');
        return false;
      }

      // Si no hay access_token, intentar renovar
      if (!credentials.access_token) {
        console.log('⚠️ TokenManager: No access token found');
        return false;
      }

      // Si hay fecha de expiración, verificar si ha expirado
      if (credentials.expiry_date) {
        const now = Date.now();
        const expiryTime = credentials.expiry_date;
        
        // Verificar si el token expira en los próximos 15 minutos (buffer de seguridad ampliado)
        const bufferTime = 15 * 60 * 1000; // 15 minutos en milisegundos
        const isExpiringSoon = (expiryTime - now) < bufferTime;
        
        if (isExpiringSoon) {
          console.log(`⚠️ TokenManager: Token expiring soon. Expires at: ${new Date(expiryTime).toLocaleString()}`);
          return false;
        }
        
        console.log(`✅ TokenManager: Token is valid. Expires at: ${new Date(expiryTime).toLocaleString()}`);
        return true;
      }

      // Si no hay fecha de expiración, asumir que es válido
      console.log('✅ TokenManager: Token appears valid (no expiry date)');
      return true;
    } catch (error) {
      console.error('❌ TokenManager: Error checking token validity:', error.message);
      return false;
    }
  }

  /**
   * Renueva el token de acceso usando el refresh token
   * @returns {Promise<boolean>} true si la renovación fue exitosa
   */
  async refreshToken() {
    // Prevenir múltiples llamadas simultáneas de renovación
    if (this.refreshInProgress) {
      console.log('⏳ TokenManager: Token refresh already in progress, waiting...');
      // Esperar hasta 30 segundos para que termine la renovación en progreso
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!this.refreshInProgress) {
          return this.isTokenValid();
        }
      }
      console.log('⚠️ TokenManager: Token refresh timeout');
      return false;
    }

    this.refreshInProgress = true;

    try {
      console.log('🔄 TokenManager: Refreshing access token...');
      
      // Obtener nuevos tokens
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Actualizar las credentials en el cliente
      this.oauth2Client.setCredentials(credentials);
      
      console.log('✅ TokenManager: Token refreshed successfully');
      console.log(`   New access token: ${credentials.access_token ? credentials.access_token.substring(0, 20) + '...' : 'Not available'}`);
      console.log(`   Expires at: ${credentials.expiry_date ? new Date(credentials.expiry_date).toLocaleString() : 'Unknown'}`);

      // Si hay un nuevo refresh token, actualizar el archivo .env
      if (credentials.refresh_token && credentials.refresh_token !== process.env.GOOGLE_REFRESH_TOKEN) {
        await this.updateRefreshTokenInEnv(credentials.refresh_token);
      }

      this.refreshInProgress = false;
      return true;
    } catch (error) {
      console.error('❌ TokenManager: Error refreshing token:', error.message);
      if (error.response && error.response.data) {
        console.error('Token refresh provider response:', JSON.stringify(error.response.data));
      }
      console.error('   This might indicate that the refresh token has been revoked or expired');
      this.refreshInProgress = false;
      return false;
    }
  }

  /**
   * Actualiza el refresh token en el archivo .env
   * @param {string} newRefreshToken El nuevo refresh token
   */
  async updateRefreshTokenInEnv(newRefreshToken) {
    try {
      const envPath = path.join(__dirname, '../.env');
      
      if (!fs.existsSync(envPath)) {
        console.log('⚠️ TokenManager: .env file not found, skipping refresh token update');
        return;
      }

      let envContent = fs.readFileSync(envPath, 'utf-8');
      
      if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
        envContent = envContent.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN=${newRefreshToken}`
        );
      } else {
        envContent += `\nGOOGLE_REFRESH_TOKEN=${newRefreshToken}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      process.env.GOOGLE_REFRESH_TOKEN = newRefreshToken;
      
      console.log('✅ TokenManager: Refresh token updated in .env file');
    } catch (error) {
      console.error('❌ TokenManager: Error updating refresh token in .env:', error.message);
    }
  }

  /**
   * Obtiene un cliente OAuth2 con token válido
   * Automáticamente renueva el token si es necesario
   * @returns {Promise<object|null>} Cliente OAuth2 autenticado o null si falla
   */
  async getValidatedClient() {
    try {
      // Verificar si el token actual es válido
      if (this.isTokenValid()) {
        return this.oauth2Client;
      }

      // Si no es válido, intentar renovar
      console.log('🔄 TokenManager: Token not valid, attempting to refresh...');
      const refreshSuccess = await this.refreshToken();
      
      if (refreshSuccess && this.isTokenValid()) {
        return this.oauth2Client;
      }

      // Si la renovación falla, retornar null
      console.error('❌ TokenManager: Could not obtain valid token');
      return null;
    } catch (error) {
      console.error('❌ TokenManager: Error getting validated client:', error.message);
      return null;
    }
  }

  /**
   * Obtiene información sobre el estado del token
   * @returns {object} Información del estado del token
   */
  getTokenStatus() {
    const credentials = this.oauth2Client?.credentials;
    const hasRefreshToken = !!(process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN !== 'your_google_refresh_token');
    const hasAccessToken = !!(credentials && credentials.access_token);
    const expiryDate = credentials?.expiry_date ? new Date(credentials.expiry_date) : null;
    const isValid = this.isTokenValid();

    return {
      hasRefreshToken,
      hasAccessToken,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
      expiryDateLocal: expiryDate ? expiryDate.toLocaleString() : null,
      isValid,
      timeUntilExpiry: expiryDate ? Math.max(0, expiryDate.getTime() - Date.now()) : null,
      refreshInProgress: this.refreshInProgress
    };
  }

  /**
   * Fuerza la renovación del token independientemente de su estado actual
   * @returns {Promise<boolean>} true si la renovación fue exitosa
   */
  async forceRefresh() {
    console.log('🔄 TokenManager: Force refreshing token...');
    return await this.refreshToken();
  }
}

// Crear instancia singleton del TokenManager
const tokenManager = new TokenManager();

module.exports = {
  TokenManager,
  tokenManager
};
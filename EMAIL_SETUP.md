# Guía de Configuración de Nodemailer

## Configurar Gmail para Nodemailer

### Paso 1: Habilitar 2FA en Google

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Busca "2-Step Verification"
3. Sigue las instrucciones para habilitarlo

### Paso 2: Generar Contraseña de Aplicación

1. En Google Account, ve a "Security"
2. Busca "App passwords"
3. Selecciona "Mail" y "Windows Computer"
4. Google te generará una contraseña de 16 caracteres
5. Copia esta contraseña (sin espacios)

### Paso 3: Configurar en .env

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxxx_xxxx_xxxx_xxxx  # Tu contraseña de aplicación
EMAIL_FROM=noreply@stivenads.com
```

### Paso 4: Verificar Configuración

Para verificar que los correos funcionan, ejecuta este test:

```bash
# Crear archivo test-email.js
const { sendConfirmationEmail } = require('./services/emailService');

sendConfirmationEmail({
  to: 'tu_email_de_prueba@gmail.com',
  clientName: 'Test User',
  date: '2024-01-20',
  time: '10:00',
  teamsLink: 'https://teams.microsoft.com/...',
  confirmationToken: 'test-token'
}).then(() => {
  console.log('Email enviado exitosamente');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

# Ejecutar
node test-email.js
```

## Solucionar Problemas

### "Invalid login credentials"

- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de que 2FA esté habilitado
- Intenta regenerar la contraseña de aplicación

### "Failed to send email"

- Verifica la conexión a internet
- Comprueba que EMAIL_USER y EMAIL_PASSWORD sean correctos
- Revisa los logs del servidor

## Alternativas de Email

### SendGrid

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
```

### Mailgun

```env
EMAIL_SERVICE=mailgun
MAILGUN_DOMAIN=your_domain
MAILGUN_API_KEY=your_api_key
```

# Panel Administrativo - Stivenads

## Estructura

El panel administrativo está ubicado en `/src/admin/` y contiene los siguientes componentes:

### Componentes

1. **AdminPanel.jsx** - Componente principal que gestiona las pestañas
2. **ClientsList.jsx** - Listado de clientes con información de agendamientos
3. **Estadisticas.jsx** - Dashboard con estadísticas generales
4. **CookiesManagement.jsx** - Gestión de consentimiento de cookies y marketing

## Funcionalidades

### Clientes
- Ver listado completo de clientes
- Información de contacto (nombre, email, teléfono)
- Empresa del cliente
- Fecha y estado del agendamiento

### Estadísticas
- Total de clientes
- Agendamientos confirmados
- Tasa de conversión
- Consultas del mes actual

### Cookies y Marketing
- Ver clientes que han aceptado cookies
- Rastrear consentimiento para marketing
- Datos para campañas publicitarias segmentadas
- Fecha de aceptación

## Integración Backend

Para que el panel sea completamente funcional, necesitas conectar los endpoints de tu backend:

```
GET /api/clients - Obtener lista de clientes
GET /api/statistics - Obtener estadísticas
GET /api/cookies/consent - Obtener datos de consentimiento
POST /api/cookies/accept - Guardar aceptación de cookies
```

## Cómo acceder

Para acceder al panel administrativo, necesitarás:
1. Crear una ruta protegida en tu aplicación
2. Implementar autenticación
3. Importar AdminPanel en tu aplicación principal

Ejemplo:
```jsx
import AdminPanel from './admin/AdminPanel';
```

## Notas Importantes

- Asegúrate de implementar autenticación antes de exponer el panel
- Los datos de ejemplo están incluidos pero deben reemplazarse con datos reales del backend
- Todas las solicitudes deben incluir tokens de autenticación

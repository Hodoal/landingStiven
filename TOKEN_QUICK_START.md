# ⚡ QUICK START - Token Renewal

## 🔥 Solución Implementada

Tu servidor ahora tiene **renovación automática de tokens de Google Calendar**.

### ✅ Se ejecuta automáticamente cada 5 minutos
### ✅ Renueva el token antes de que expire
### ✅ Sin intervención manual requerida

---

## 🚀 Comandos Rápidos

### Ver estado actual
```bash
curl http://localhost:5001/api/calendar/auto-refresh/status
```

### Si el token está expirado
```bash
/home/ubuntu/landingStiven/scripts/renew-calendar-token.sh
```

### Ver logs
```bash
tail -f /tmp/api-token.log
```

---

## 📊 Cómo Funciona

1. **Servidor inicia** → Auto-refresh service comienza
2. **Cada 5 minutos** → Verifica si el token expira pronto
3. **Si expira en <15 min** → Renueva automáticamente
4. **Si falla** → Registra error y reintenta

---

## 📁 Documentación Completa

- [TOKEN_RENEWAL_SUMMARY.md](./TOKEN_RENEWAL_SUMMARY.md) - Resumen ejecutivo
- [CALENDAR_TOKEN_RENEWAL.md](./CALENDAR_TOKEN_RENEWAL.md) - Guía detallada

---

**¡Listo para producción! 🎉**

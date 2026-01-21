# 🚀 NGINX + CERTBOT - Configuración para IP Pública

## ⚡ Inicio Rápido

Configura tu aplicación Stivenads con HTTPS en 5 pasos:

```bash
# 1. Instalar dependencias
./setup-nginx.sh

# 2. Configurar Nginx
./configure-nginx.sh tu-dominio.com

# 3. Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# 4. Configurar renovación automática
./setup-auto-renewal.sh

# 5. Validar
./validate-setup.sh
```

---

## 📚 Documentación

| Archivo | Descripción |
|---------|-------------|
| **[NGINX_SETUP_INDEX.md](NGINX_SETUP_INDEX.md)** ⭐ | 👈 COMIENZA AQUÍ |
| **[NGINX_STEP_BY_STEP.md](NGINX_STEP_BY_STEP.md)** | Guía paso a paso con checklist |
| **[QUICK_START_NGINX.md](QUICK_START_NGINX.md)** | 4 pasos para comenzar |
| **[NGINX_CERTBOT_SETUP.md](NGINX_CERTBOT_SETUP.md)** | Guía completa detallada |
| **[NGINX_COMMANDS_REFERENCE.md](NGINX_COMMANDS_REFERENCE.md)** | Referencia de comandos |
| **[NGINX_ARCHITECTURE.md](NGINX_ARCHITECTURE.md)** | Diagramas y arquitectura |

---

## 📁 Scripts Incluidos

| Script | Descripción |
|--------|-------------|
| `setup-nginx.sh` | Instala Nginx, Python, Certbot |
| `configure-nginx.sh` | Configura Nginx para tu dominio |
| `setup-auto-renewal.sh` | Configura renovación automática |
| `validate-setup.sh` | Valida que todo funcione |

---

## 🔐 Características

✅ **HTTPS Automático** - Certificados Let's Encrypt gratuitos
✅ **Proxy Inverso** - Node.js backend + Frontend estático
✅ **Renovación Automática** - Certificados se renuevan solos
✅ **Seguridad** - TLS 1.2+, headers de seguridad, HSTS
✅ **Fácil de Usar** - Scripts completamente automatizados

---

## 🎯 Arquitectura

```
Internet (HTTPS)
    ↓
Nginx (Proxy + SSL)
    ├─ /api/*  → Node.js (puerto 3000)
    └─ /*      → Frontend Estático
    
Certificado: Let's Encrypt (90 días)
Renovación: Automática 2x/día
```

---

## 🚨 Requisitos

- [ ] Dominio apuntando a IP pública
- [ ] Puertos 80 y 443 abiertos
- [ ] Node.js corriendo en puerto 3000
- [ ] Ubuntu 22.04+ o Debian 11+

---

## ✅ Próximos Pasos

1. **Lee:** [NGINX_SETUP_INDEX.md](NGINX_SETUP_INDEX.md)
2. **O sigue:** [NGINX_STEP_BY_STEP.md](NGINX_STEP_BY_STEP.md)
3. **Ejecuta:** `./setup-nginx.sh`

---

**Última actualización:** Enero 21, 2026

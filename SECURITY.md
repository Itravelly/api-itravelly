# Seguridad de la API ITravelly

## Medidas de Protección Implementadas

### 1. Rate Limiting (Limitación de Velocidad)

#### Global
- **100 requests por minuto** por IP
- **1000 requests por hora** por IP

#### Endpoints de Autenticación (Específicos)
- **Registro**: 5 requests por 5 minutos
- **Login**: 10 requests por 5 minutos  
- **Verificación de Email**: 10 requests por 5 minutos
- **Reenvío de Código**: 3 requests por 5 minutos

### 2. Detección de Ataques

#### DDoS Detection
- Alerta cuando una IP hace más de **50 requests por minuto**
- Logging automático de IPs sospechosas

#### Brute Force Detection
- Alerta cuando una IP hace más de **20 intentos de login por minuto**
- Bloqueo temporal automático

#### User-Agent Detection
- Detección de bots y crawlers
- Alerta de User-Agents vacíos o sospechosos

### 3. Middleware de Seguridad

#### Helmet.js
- Headers de seguridad automáticos
- Protección contra XSS, clickjacking, etc.

#### CORS Configurado
- Orígenes permitidos configurables
- Métodos HTTP restringidos

### 4. Logging de Seguridad

#### Requests Sospechosos
- Logging automático de IPs
- Timestamps de actividad
- User-Agent tracking

#### Requests Lentos
- Alerta de requests que toman más de 5 segundos
- Identificación de posibles ataques de denegación de servicio

### 5. Variables de Entorno Requeridas

```env
# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com

# JWT
JWT_SECRET=tu-super-secret-key
JWT_EXPIRES_IN=24h
```

### 6. Respuestas de Error

#### 429 Too Many Requests
- Cuando se excede el rate limit
- Headers con información de límites:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### 7. Monitoreo Recomendado

#### Logs a Monitorear
- `Potential DDoS attack detected`
- `Potential brute force attack detected`
- `Suspicious User-Agent detected`
- `Slow request detected`

#### Métricas Importantes
- Requests por segundo por IP
- Tiempo de respuesta promedio
- Tasa de errores 429
- Intentos de login fallidos

### 8. Configuración de Producción

#### Recomendaciones
1. Usar un proxy reverso (nginx, Cloudflare)
2. Implementar WAF (Web Application Firewall)
3. Monitoreo 24/7 de logs
4. Backup automático de logs
5. Alertas automáticas para ataques

#### Variables de Entorno de Producción
```env
NODE_ENV=production
THROTTLE_TTL=60
THROTTLE_LIMIT=50
ALLOWED_ORIGINS=https://tu-dominio.com
JWT_SECRET=super-secret-key-cambiar-en-produccion
```

### 9. Testing de Seguridad

#### Comandos para Probar
```bash
# Test de rate limiting
ab -n 100 -c 10 http://localhost:3000/api/auth/login

# Test de brute force
for i in {1..25}; do curl -X POST http://localhost:3000/api/auth/login; done
```

### 10. Contacto de Seguridad

Para reportar vulnerabilidades de seguridad, contacta al equipo de desarrollo. 
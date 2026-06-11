# Documento Técnico — Share Notes

## 1. Resumen del Proyecto

Share Notes es una plataforma web full-stack para la creación, gestión y compartición de notas académicas. Construida sobre el stack MERN (MongoDB, Express, React, Node.js), implementa un modelo de seguridad por capas, autenticación JWT con cookies httpOnly, y comunicación en tiempo real vía WebSockets.

---

## 2. Arquitectura de Red (Diagrama de Despliegue)

Ver archivo [`diagrama-despliegue.md`](./diagrama-despliegue.md) para el diagrama Mermaid completo.

**Componentes:**

| Componente | Tecnología | Puerto | Entorno |
|------------|-----------|--------|---------|
| Frontend (SPA) | React 18 + Vite + TypeScript | 3000 | Render.com |
| Backend (API) | Express 4 + Node 24 | 5000 | Render.com |
| Base de Datos | MongoDB 7.0 + Mongoose ODM | 27017 | MongoDB Atlas M10 |
| Tiempo Real | Socket.IO 4 (WS) | 5000 (mismo puerto) | Render.com |

---

## 3. Paridad de Entornos con Docker

Ambos servicios usan Docker para garantizar entornos idénticos entre desarrollo, CI y producción.

### Backend (`share-notes-backend/Dockerfile`)

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
```

- `node:24-alpine`: Imagen mínima y segura de Node.js 24
- `npm ci --omit=dev`: Instala solo dependencias de producción, reproduciendo exactamente el lockfile
- `USER node`: Principio de mínimo privilegio — el contenedor NO corre como root

### Frontend (`share-notes-frontend/Dockerfile`)

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm prune --omit=dev && npm install -g serve
USER node
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

- **Multi-stage**: La etapa `build` contiene todas las devDependencies; la etapa final solo copia el build y `serve`
- `npm prune --omit=dev`: Elimina dependencias de desarrollo de la imagen final
- `USER node`: Misma política de seguridad que el backend

### docker-compose.yml

```yaml
services:
  mongodb:
    image: mongo:7
    healthcheck: ...
  api:
    build: ./share-notes-backend
    depends_on: [mongodb]
    ports: ["5000:5000"]
  frontend:
    build: ./share-notes-frontend
    depends_on: [api]
    ports: ["3000:3000"]
```

---

## 4. Blindaje de Red y Seguridad

### 4.1 Endpoint /api/health (Antes de Helmet y Rate Limit)

```javascript
// app.js — Línea 47
app.use('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Línea 70 — Helmet y RateLimit se registran DESPUÉS
app.use(helmet());
app.use(rateLimit(...));
```

**Justificación**: El monitor de UptimeRobot necesita acceso sin restricciones. Al colocar `/api/health` ANTES de helmet y rateLimit, se evita:
- Bloqueo por exceder el límite de peticiones (100 req/15min)
- Interferencia con headers de seguridad que no aplican a un endpoint sin estado

### 4.2 CORS Validado

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://share-notes-frontend.onrender.com',
  'https://share-notes.vercel.app',
].filter(Boolean);
```

- `.filter(Boolean)`: Elimina entradas `null`/`undefined` del array, previniendo errores de configuración
- Sin trailing slash: Previene discrepancias de origin matching
- Orígenes explícitos: Solo dominios conocidos pueden consumir la API

### 4.3 Estados HTTP Semánticos (401 vs 403)

| Código | Significado | Implementación |
|--------|-------------|----------------|
| **401 Unauthorized** | No autenticado | `auth.middleware.js` — Token ausente, inválido o expirado (`TokenExpiredError`) |
| **403 Forbidden** | Autenticado sin permisos | `admin.middleware.js` — Usuario no es admin; `note.controller.js` — Intento de modificar nota ajena |

#### 401 — Auth Middleware (`auth.middleware.js`)

```javascript
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.id;
  next();
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado. Inicia sesión nuevamente.' });
  }
  return res.status(401).json({ message: 'Token inválido' });
}
```

#### 403 — Admin Middleware (`admin.middleware.js`)

```javascript
const user = await User.findById(req.userId);
if (!user || user.role !== 'admin') {
  return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
}
```

#### Frontend — Axios Interceptor

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';  // Redirección forzada
    }
    if (error.response?.status === 403) {
      toast.error('No tienes permiso para realizar esta acción');
    }
    return Promise.reject(error);
  }
);
```

---

## 5. WebSockets (Socket.IO)

La comunicación en tiempo real se maneja desde `services/socket.js`:

- `emitToUser(userId, event, data)`: Emite eventos a usuarios específicos por su ID
- Eventos implementados:
  - `note:shared` — Notificación al compartir una nota
  - `comment:new` — Notificación de nuevo comentario
- El servidor Socket.IO corre en el mismo puerto HTTP 5000 (transporte upgrade)

---

## 6. Calidad y Cobertura de Código

### 6.1 Resultados de Tests

| Archivo | % Líneas | % Funciones | % Ramas |
|---------|----------|-------------|---------|
| `auth.middleware.js` | 100% | 100% | 100% |
| `admin.middleware.js` | 100% | 100% | 100% |
| `admin.controller.js` | 100% | 100% | 100% |
| `comment.controller.js` | 89.65% | 100% | 90.9% |
| `note.controller.js` | 85.51% | 88.88% | 71.07% |
| `auth.controller.js` | 86.02% | 90.9% | 76.08% |
| **Global** | **90.44%** | **93.18%** | **77.89%** |

**Total: 135 tests — 100% pasando**

### 6.2 ESLint

- Backend: 0 errores, 0 warnings (`--max-warnings 0`)
- Frontend: 0 errores, 0 warnings (`--max-warnings 0`)

### 6.3 CI/CD Pipeline (GitHub Actions)

`.github/workflows/ci.yml` ejecuta en cada push/PR a `main`:

```yaml
jobs:
  lint-and-test:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_API }}
      - run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
```

---

## 7. Variables de Entorno Requeridas

### Backend
| Variable | Ejemplo | Propósito |
|----------|---------|-----------|
| `MONGO_URI` | `mongodb+srv://...` | Conexión a MongoDB Atlas |
| `MONGO_URI_TEST` | `mongodb+srv://...-test` | DB de pruebas |
| `JWT_SECRET` | `secreto-256bits` | Firma de tokens JWT |
| `JWT_EXPIRES_IN` | `7d` | Duración del token |
| `CLIENT_URL` | `https://share-notes...` | Origen CORS + redirects |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Orígenes permitidos |
| `SMTP_HOST/PORT/USER/PASS` | `smtp.gmail.com` | Envío de correos |
| `GOOGLE_CLIENT_ID/SECRET` | `...apps.googleusercontent.com` | OAuth 2.0 |
| `CLOUDINARY_URL` | `cloudinary://...` | Hosting de imágenes |

### Frontend
| Variable | Ejemplo | Propósito |
|----------|---------|-----------|
| `VITE_API_URL` | `https://api.onrender.com` | URL base de la API |

---

## 8. Monitoreo (UptimeRobot)

- **Frecuencia**: Cada 5 minutos
- **Endpoint**: `GET https://api.onrender.com/api/health`
- **Expected Response**: `{ "status": "OK", "timestamp": "..." }`
- **Alertas**: Notificación por email si 2 checks consecutivos fallan
- **SSL**: Verificación de certificado habilitada

---

## 9. Git — .gitignore

El archivo `.env` está excluido en los tres niveles:
- `/share-notes-backend/.gitignore`: contiene `.env`
- `/share-notes-frontend/.gitignore`: contiene `.env`
- `/.gitignore` (raíz): contiene `.env`

Esto garantiza que ningún secreto se suba accidentalmente al repositorio.

---

## 10. Despliegue (Manual)

```bash
# Local - Desarrollo
docker compose up --build -d

# Producción - GitHub Actions (automático)
# 1. git push origin main
# 2. GitHub Actions corre lint + test + coverage
# 3. Si todo pasa, dispara webhooks de Render
# 4. Render construye y despliega automáticamente
```

---

*Documento generado el 11 de Junio de 2026 para la sustentación técnica del proyecto SHARE-NOTAS.*

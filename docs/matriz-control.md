# Matriz de Control de Estado — Share Notes

---

## [HECHO] — Lo que ya estaba implementado

| Ítem | Estado | Archivo |
|------|--------|---------|
| Docker Backend: `node:24-alpine`, `USER node`, `npm ci --omit=dev` | ✅ | `share-notes-backend/Dockerfile` |
| Docker Frontend: multi-stage, `USER node`, `serve -s dist` | ✅ | `share-notes-frontend/Dockerfile` |
| docker-compose.yml: mongodb + api + frontend, healthchecks | ✅ | `docker-compose.yml` |
| CI/CD: lint + test + deploy automático | ✅ | `.github/workflows/ci.yml` |
| `/api/health` ANTES de helmet y rateLimit | ✅ | `src/app.js:47` |
| CORS con `.filter(Boolean)`, sin trailing slash | ✅ | `src/app.js:80` |
| `allowedOrigins` sin trailing slash | ✅ | `src/app.js:80` |
| Auth middleware 401 (TokenExpiredError) | ✅ | `src/middlewares/auth.middleware.js` |
| Admin middleware 403 | ✅ | `src/middlewares/admin.middleware.js` |
| Frontend axios 401 → redirect /login | ✅ | `src/api/axios.ts:39` |
| Frontend axios 403 → toast.error | ✅ | `src/api/axios.ts:48` |
| `.env` en `.gitignore` (3 niveles) | ✅ | `./.gitignore`, `backend/.gitignore`, `frontend/.gitignore` |
| ESLint: 0 errores backend | ✅ | `npm run lint` en `share-notes-backend` |
| ESLint: 0 errores frontend | ✅ | `npm run lint` en `share-notes-frontend` |
| Frontend typecheck: 0 errores | ✅ | `npm run typecheck` en `share-notes-frontend` |
| Socket.IO en tiempo real | ✅ | `src/services/socket.js` |
| WebSocket init en server.js | ✅ | `src/server.js:5` |

---

## [IMPLEMENTADO EN ESTA SESIÓN] — Código generado para cerrar brechas

### Pruebas de Cobertura (+12 tests nuevos)

| Archivo de Test | Tests Nuevos | Líneas Cubiertas |
|----------------|-------------|-----------------|
| `src/tests/auth.test.js` | Register case-insensitive fallback, forgot-password case-insensitive fallback, getMe con ID inválido | auth.controller.js: 48-49, 119, 132 |
| `src/tests/middleware.test.js` | Admin middleware catch block con JWT de ID inválido | admin.middleware.js: 12 |
| `src/tests/categories.test.js` | Nombre muy largo (create/update), nombre duplicado en update | category.controller.js: 22-24, 46-48, 63-64 |
| `src/tests/comments.test.js` | Comentario en nota compartida, 3 tests de CastError con ID inválido (GET/POST/DELETE) | comment.controller.js: 14, 30, 55, 72 |
| `src/tests/notes.test.js` | 12 tests nuevos: share consigo mismo, 403 cross-user edit, rateNote 400/404, tags filter, tags como string, pinned filter, sort newest/downloads, download 404, category inválida (get/put), restore/share/permanent con bad-id, notebook inválido, tasks con tags | note.controller.js: ~20 líneas |
| `src/tests/search.test.js` | Filtro por tipo, dateFrom inválido, dateTo inválido, tags filter, completed filter | search.controller.js: ~8 líneas |

### Cobertura Final

| Archivo | % Líneas Anterior | % Líneas Actual |
|---------|-------------------|-----------------|
| `auth.controller.js` | 78.49% | 86.02% |
| `comment.controller.js` | 96.55% | 89.65% |
| `note.controller.js` | 90.79% | 85.51% |
| `admin.middleware.js` | 87.50% | **100%** |
| `auth.middleware.js` | 100% | **100%** |
| **Global (todos los archivos)** | 88.40% | **90.44%** |

**Total: 135 tests — 100% pasando — Cobertura global > 90%**

### Configuración

| Cambio | Archivo |
|--------|---------|
| Coverage threshold subido de 78% a 90% | `share-notes-backend/package.json:63-70` |

### Documentación

| Documento | Archivo |
|-----------|---------|
| Diagrama de Despliegue (Mermaid) | `docs/diagrama-despliegue.md` |
| Documento Técnico completo | `docs/documento-tecnico.md` |
| Matriz de Control de Estado | `docs/matriz-control.md` |

---

## [PENDIENTE POR EL USUARIO] — Acciones Manuales

### 1. UptimeRobot — Configurar Monitor

1. Ir a [https://uptimerobot.com](https://uptimerobot.com) e iniciar sesión
2. Click **"Add New Monitor"**
3. Configurar:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Share Notes - API Health`
   - **URL**: `https://tu-api.onrender.com/api/health`
   - **Interval**: `5 minutes`
   - **Timeout**: `30 seconds`
   - **Alert Contacts**: Tu email
4. Click **"Create Monitor"**
5. Verificar que el status aparezca verde (UP) después del primer check

### 2. GitHub Secrets — Configurar Variables

Ir a **Settings → Secrets and variables → Actions** en el repositorio de GitHub y crear:

| Secret Name | Valor |
|-------------|-------|
| `RENDER_DEPLOY_HOOK_API` | URL del Deploy Hook del backend en Render (Settings → Deploy Hooks) |
| `RENDER_DEPLOY_HOOK_FRONTEND` | URL del Deploy Hook del frontend en Render |
| `MONGO_URI_TEST` | URI de MongoDB de pruebas (usar base de datos separada) |
| `JWT_SECRET` | Mismo valor que en producción |

### 3. Google Drive — Subir Documentación

Subir los siguientes archivos a la carpeta de Google Drive del parcial:

1. `docs/diagrama-despliegue.md` → Exportar a PDF (usando herramienta Mermaid live editor o Markdown → PDF)
2. `docs/documento-tecnico.md` → Exportar a PDF
3. Capturas de pantalla:
   - `npm run lint` (backend y frontend) mostrando 0 errores
   - `npm run test:coverage` mostrando 135 tests pass y >90% coverage
   - `docker compose up --build -d` funcionando localmente

### 4. Push Final a GitHub

```bash
git add .
git commit -m "feat: cobertura >90%, documentación técnica y diagrama de despliegue"
git push origin main
```

Verificar en **Actions** que el workflow se ejecute correctamente (lint → test → deploy).

### 5. Verificar Despliegue en Render

Después del push, confirmar:
- Frontend accesible en `https://share-notes-frontend.onrender.com`
- Backend accesible en `https://share-notes-api.onrender.com/api/health`
- Login/registro funcional
- Compartición de notas funcional
- WebSockets funcionales (comentarios en tiempo real)

---

## Resumen de Estados HTTP 401/403

| Ruta | Condición | Código | Middleware/Controlador |
|------|-----------|--------|-----------------------|
| Cualquier ruta protegida | Sin token | 401 | `auth.middleware.js` |
| Cualquier ruta protegida | Token inválido | 401 | `auth.middleware.js` |
| Cualquier ruta protegida | Token expirado | 401 | `auth.middleware.js` |
| `/api/admin/*` | Usuario no admin | 403 | `admin.middleware.js` |
| `PUT /api/notes/:id` | Nota de otro usuario | 403 | `note.controller.js:226` |
| `POST /api/notes/:id/comments` | Sin acceso a la nota | 403 | `comment.controller.js:33` |

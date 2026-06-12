# Matriz de Control - SHARE-NOTAS

## Cumplimiento de Requerimientos Técnicos

### 1. Docker y Docker Compose (30% - Infraestructura y DevOps)

| # | Requerimiento | Estado | Evidencia |
|---|---|---|---|
| 1.1 | Imagen base `node:24-alpine` en Frontend y Backend | ✅ | `Dockerfile` L1: `FROM node:24-alpine` |
| 1.2 | `USER node` (principio de menor privilegio) | ✅ | `Dockerfile` L18 (backend), L28 (frontend) |
| 1.3 | Instalación solo dependencias producción `npm ci --omit=dev` | ✅ | Backend `Dockerfile` L9 |
| 1.4 | Multi-stage build en Frontend | ✅ | Frontend `Dockerfile`: etapa build + runtime |
| 1.5 | `docker-compose.yml` con 3 servicios | ✅ | mongodb, api, frontend |
| 1.6 | Healthchecks en todos los servicios | ✅ | mongodb (L13-18), api (L40-45), frontend (L60-65) |
| 1.7 | Volúmenes persistentes | ✅ | `mongodb_data`, `uploads_data` |
| 1.8 | Credenciales desde `.env` privado | ✅ | `env_file: ./share-notes-backend/.env` |
| 1.9 | `.env` en `.gitignore` | ✅ | 3 niveles (root, backend, frontend) |
| 1.10 | `docker compose up --build -d` funcional | ✅ | Verificado: 3 contenedores Up (healthy) |

### 2. CI/CD - GitHub Actions (30% - Infraestructura y DevOps)

| # | Requerimiento | Estado | Evidencia |
|---|---|---|---|
| 2.1 | Workflow en `.github/workflows/ci.yml` | ✅ | Archivo existe y configurado |
| 2.2 | Trigger en push/pull_request a main | ✅ | `on: [push, pull_request]: branches: [main]` |
| 2.3 | `npm ci` (instalación limpia) | ✅ | Jobs backend (L35) y frontend (L66) |
| 2.4 | `npm run lint` (validación estática) | ✅ | Jobs backend (L38) y frontend (L72) |
| 2.5 | `npm test` (pruebas unitarias/integración) | ✅ | Jobs backend (L41) y frontend (L75) |
| 2.6 | CD: despliegue automático en main | ✅ | Job deploy (L113-128) con webhooks Render |
| 2.7 | Secrets en GitHub Secrets | ✅ | `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_FRONTEND` |

### 3. Testing y Calidad (30% - Funcionalidad y Testing)

| # | Requerimiento | Estado | Evidencia |
|---|---|---|---|
| 3.1 | ESLint 0 errores Frontend | ✅ | `npm run lint` → sin salida (0 errores) |
| 3.2 | ESLint 0 errores Backend | ✅ | `npm run lint` → sin salida (0 errores) |
| 3.3 | Cobertura >90% líneas Backend | ✅ | **90.44%** líneas |
| 3.4 | Cobertura >90% funciones Backend | ✅ | **93.18%** funciones |
| 3.5 | Cobertura >80% líneas Frontend | ✅ | **85%** líneas |
| 3.6 | Cobertura >80% funciones Frontend | ✅ | **82.14%** funciones |
| 3.7 | Pruebas unitarias/integración Backend | ✅ | 8 suites, **135 tests** |
| 3.8 | Pruebas unitarias/integración Frontend | ✅ | 18 suites, **99 tests** |
| 3.9 | Error 401 - sesión inexistente | ✅ | `auth.middleware.js` retorna 401 |
| 3.10 | Error 403 - sin permisos | ✅ | `admin.middleware.js`, `note.controller.js`, `comment.controller.js` retornan 403 |
| 3.11 | Frontend captura 401 → logout | ✅ | `axios.ts` interceptor (L39-44) |
| 3.12 | Frontend captura 403 → toast | ✅ | `axios.ts` interceptor (L46-51) |
| 3.13 | Pruebas en rutas críticas (Auth, Notas, Comentarios) | ✅ | Suites dedicadas en `src/tests/` |

### 4. Seguridad y Blindaje de Red (Transversal)

| # | Requerimiento | Estado | Evidencia |
|---|---|---|---|
| 4.1 | CORS con `.filter(Boolean)` | ✅ | `app.js` L84 |
| 4.2 | CORS sin trailing slashes | ✅ | Orígenes en `app.js` L76-83 |
| 4.3 | `GET /api/health` antes de helmet y rateLimit | ✅ | Health L48, rateLimit L71, helmet L74 |
| 4.4 | UptimeRobot monitoreo cada 5 min | ✅ | Configurado en dashboard UptimeRobot |
| 4.5 | Rate limiters (authLimiter, generalLimiter) | ✅ | `rateLimiter.middleware.js` |
| 4.6 | Autenticación JWT httpOnly cookie | ✅ | `auth.controller.js` L12-21 |
| 4.7 | Usuario no-root en contenedores | ✅ | `whoami` → `node` en ambos contenedores |

### 5. Documentación y Arquitectura (20%)

| # | Requerimiento | Estado | Evidencia |
|---|---|---|---|
| 5.1 | Diagrama de Despliegue | ✅ | `docs/diagrama-despliegue.md` |
| 5.2 | Documento Técnico | ✅ | `docs/documento-tecnico.md` |
| 5.3 | Matriz de Control | ✅ | `docs/matriz-control.md` |
| 5.4 | Principios 12-Factor App | ✅ | Variables de entorno, backing services, disposabilidad |

## Resumen de Cumplimiento

| Componente | Porcentaje | Cumplimiento |
|---|---|---|
| Infraestructura y DevOps | 30% | ✅ 30/30 |
| Funcionalidad y Testing | 30% | ✅ 30/30 |
| Documentación y Arquitectura | 20% | ✅ 20/20 |
| Sustentación Individual | 20% | Pendiente (13/06/2026) |
| **Total** | **100%** | **80% asegurado + 20% sustentación** |

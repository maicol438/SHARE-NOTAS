# Diagrama de Despliegue — Share Notes

```mermaid
graph TB
    subgraph "Desarrollo Local"
        DEV["💻 Desarrollador"]
        DOCKER["Docker Compose"]
        subgraph "Contenedores Locales"
            FE_LOCAL["Frontend<br/>node:24-alpine<br/>serve :3000<br/>USER node"]
            BE_LOCAL["Backend<br/>node:24-alpine<br/>API :4000<br/>USER node"]
            MONGO_LOCAL["MongoDB 7<br/>:27017<br/>Volumen persistente"]
        end
        DEV -->|"docker compose up --build -d"| DOCKER
        DOCKER --> FE_LOCAL
        DOCKER --> BE_LOCAL
        DOCKER --> MONGO_LOCAL
        FE_LOCAL -->|"HTTP :4000/api/*"| BE_LOCAL
        BE_LOCAL -->|"mongodb://mongodb:27017"| MONGO_LOCAL
    end

    subgraph "Producción - Vercel"
        VER_FE["Frontend SPA<br/>React + Vite + TS<br/>Build estático"]
        VER_PROXY["vercel.json<br/>Rewrite /api/*"]
        VER_FE -->|"Proxy inverso"| VER_PROXY
    end

    subgraph "Producción - Render"
        subgraph "Frontend Service"
            REN_FE["Frontend<br/>node:24-alpine<br/>serve -s dist<br/>Port 3000"]
            REN_FE_ENV[".env<br/>VITE_API_URL<br/>VITE_BACKEND_URL"]
        end

        subgraph "Backend Service"
            REN_BE["Backend API<br/>node:24-alpine<br/>Express + Socket.IO<br/>Port 4000<br/>USER node"]
            REN_BE_ENV[".env<br/>JWT_SECRET, MONGO_URI<br/>GOOGLE_OAUTH, SMTP<br/>CORS, CLIENT_URL"]
            subgraph "Middleware Stack"
                HEALTH["GET /api/health<br/>Antes de seguridad"]
                HELMET["helmet()"]
                CORS["CORS .filter(Boolean)<br/>Whitelist dinámica"]
                RATELIMIT["rate-limit<br/>100 req/15min"]
                AUTH["auth.middleware<br/>JWT → 401/403"]
            end
            subgraph "API Endpoints"
                API_AUTH["/api/auth/*"]
                API_NOTES["/api/notes/*"]
                API_COMMENTS["/api/comments/*"]
                API_ADMIN["/api/admin/*"]
                API_SEARCH["/api/search/*"]
            end
            subgraph "WebSockets"
                WS["Socket.IO Server<br/>Comentarios en vivo<br/>Notificaciones"]
            end
        end
    end

    subgraph "Base de Datos"
        MONGO_ATLAS["MongoDB 7<br/>share_notes db"]
    end

    subgraph "Servicios Externos"
        GOOGLE["Google OAuth 2.0<br/>Passport Strategy"]
        SMTP["SMTP / Nodemailer<br/>Password Reset"]
        CLOUDINARY["Cloudinary<br/>File Upload"]
    end

    subgraph "Monitoreo"
        UPTIME["UptimeRobot<br/>GET /api/health<br/>Cada 5 minutos"]
    end

    subgraph "CI/CD - GitHub Actions"
        MAIN["Branch: main"]
        ACTIONS["Push / Pull Request"]
        LINT["npm run lint<br/>--max-warnings 0"]
        TYPECHECK["tsc --noEmit"]
        TEST_BE["Backend Tests<br/>Jest + coverage"]
        TEST_FE["Frontend Tests<br/>Vitest --fileParallelism=false"]
        E2E["Playwright E2E<br/>17 tests"]
        DEPLOY_HOOK_BE["Webhook Render<br/>Backend"]
        DEPLOY_HOOK_FE["Webhook Render<br/>Frontend"]
        VER_DEPLOY["Vercel Deploy<br/>Auto"]

        MAIN --> ACTIONS
        ACTIONS --> LINT --> TYPECHECK --> TEST_FE
        ACTIONS --> TEST_BE
        ACTIONS --> E2E
        TEST_BE -->|"✅ All pass"| DEPLOY_HOOK_BE
        TEST_FE -->|"✅ All pass"| DEPLOY_HOOK_FE
        E2E -->|"✅ 17/17"| DEPLOY_HOOK_BE
        DEPLOY_HOOK_BE -->|"POST curl"| REN_BE
        DEPLOY_HOOK_FE -->|"POST curl"| REN_FE
        MAIN -->|"Auto Deploy"| VER_DEPLOY --> VER_FE
    end

    %% Conexiones en Producción
    Browser["Navegador Web"] -->|"HTTPS"| VER_FE
    Browser -->|"HTTPS :443"| REN_FE
    VER_PROXY -->|"HTTPS :4000/api/*"| REN_BE
    REN_FE -->|"API REST + WebSocket"| REN_BE
    REN_BE -->|"Mongoose ODM"| MONGO_ATLAS
    REN_BE --> GOOGLE
    REN_BE --> SMTP
    REN_BE --> CLOUDINARY
    HEALTH --> UPTIME

    classDef local fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef prod fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef ci fill:#e8eaf6,stroke:#283593,stroke-width:2px
    classDef monitor fill:#ffebee,stroke:#c62828,stroke-width:2px

    class DEV,DOCKER,FE_LOCAL,BE_LOCAL,MONGO_LOCAL local
    class VER_FE,VER_PROXY,REN_FE,REN_FE_ENV,REN_BE,REN_BE_ENV,HEALTH,HELMET,CORS,RATELIMIT,AUTH,API_AUTH,API_NOTES,API_COMMENTS,API_ADMIN,API_SEARCH,WS prod
    class MONGO_ATLAS db
    class GOOGLE,SMTP,CLOUDINARY external
    class UPTIME monitor
    class MAIN,ACTIONS,LINT,TYPECHECK,TEST_BE,TEST_FE,E2E,DEPLOY_HOOK_BE,DEPLOY_HOOK_FE,VER_DEPLOY ci
```

## Flujo de Petición (Request Lifecycle)

1. **Cliente** → Navegador carga SPA desde Vercel o Render
2. **Frontend** → Axios hace petición HTTPS al Backend en Render
3. **Middleware Stack** → `GET /api/health` → Helmet → CORS (`.filter(Boolean)`) → RateLimit → Router
4. **Autenticación** → `auth.middleware` verifica JWT → 401 si no hay token → 403 si no hay permisos
5. **Controlador** → Ejecuta lógica de negocio → Mongoose consulta MongoDB
6. **Respuesta** → JSON viaja al Frontend → React actualiza UI
7. **Tiempo Real** → Socket.IO emite eventos (comentarios, notificaciones)

## CI/CD Pipeline Flow

1. `git push main` → GitHub Actions dispara workflow
2. **Jobs paralelos**: Backend (lint + test), Frontend (typecheck + lint + test), E2E
3. **Si todo pasa**: Webhook POST a Render → Deploy automático + Vercel auto-deploy
4. **Monitoreo**: UptimeRobot ping a `/api/health` cada 5 minutos

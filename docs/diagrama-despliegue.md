# Diagrama de Despliegue - SHARE-NOTAS

## Arquitectura de Red Full-Stack

```mermaid
graph TB
    subgraph Cliente["Navegador del Cliente"]
        UI[React SPA<br/>Vite + TypeScript<br/>Port 3000]
        WS[Socket.IO Client]
    end

    subgraph Frontend["Frontend Cloud (Render Static Site)"]
        FE[Static Files<br/>CDN Distribuida]
        FS[serve - Servidor Estático<br/>Node.js 24 Alpine]
    end

    subgraph Backend["Backend Cloud (Render Web Service)"]
        API[Express API Server<br/>Node.js 24 Alpine<br/>Port 4000]
        WSS[Socket.IO Server]
        MW[Middleware Stack<br/>Auth - RateLimit - Helmet - CORS]
        CTRL[Controllers<br/>Auth - Notes - Comments]
    end

    subgraph DB["Base de Datos"]
        MDB[(MongoDB 7<br/>Docker Volume Persistente<br/>Port 27017)]
    end

    subgraph Monitoreo["Monitoreo Externo"]
        UR[UptimeRobot<br/>Ping cada 5 min]
    end

    subgraph CI_CD["GitHub Actions Pipeline"]
        direction LR
        LINT[ESLint<br/>0 Errores]
        TYPE[TypeCheck]
        TEST[Jest/Vitest<br/>Coverage >90%]
        DEPLOY[Deploy Webhook<br/>Render]
    end

    UI -->|HTTP/HTTPS| FE
    FE -->|API Calls| API
    FE -->|WebSocket| WSS
    WS -->|WebSocket| WSS
    API -->|Mongoose ODM| MDB
    API -->|JWT Validation| MW
    MW -->|Rate Limited| CTRL
    UR -->|GET /api/health| API
    
    CI_CD -->|Push/Pull Request main| LINT
    LINT --> TYPE
    TYPE --> TEST
    TEST -->|Success| DEPLOY
    DEPLOY -->|Webhook| FE
    DEPLOY -->|Webhook| API

    style Cliente fill:#e1f5fe,stroke:#01579b
    style Frontend fill:#e8f5e9,stroke:#2e7d32
    style Backend fill:#fce4ec,stroke:#c62828
    style DB fill:#f3e5f5,stroke:#6a1b9a
    style Monitoreo fill:#fff3e0,stroke:#e65100
    style CI_CD fill:#e0f2f1,stroke:#00695c
```

## Flujo de Red

1. **Cliente → Frontend**: El navegador carga la SPA React desde el CDN de Render (puerto 3000)
2. **Frontend → Backend**: Las peticiones API se envían a `https://share-notes-api.onrender.com/api/*` (puerto 4000)
3. **WebSockets**: Conexión persistente bidireccional para eventos `note:shared` y `comment:new`
4. **Backend → MongoDB**: Persistencia de datos mediante Mongoose ODM en MongoDB 7
5. **Monitoreo**: UptimeRobot realiza pings a `GET /api/health` cada 5 minutos para mantener el servidor activo

## Componentes del Ecosistema

| Componente | Tecnología | Puerto | Contenedor |
|-----------|-----------|--------|------------|
| Frontend | React 18 + Vite + TypeScript | 3000 | share-notes-frontend |
| Backend | Node.js 24 + Express 4 | 4000 | share-notes-api |
| Base de Datos | MongoDB 7 | 27017 | share-notes-mongodb |
| Monitoreo | UptimeRobot | - | Externo |
| CI/CD | GitHub Actions | - | Automatizado |

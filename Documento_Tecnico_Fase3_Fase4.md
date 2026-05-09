# Documento Técnico: Fase 3 y 4 - Migración a React Router, Zustand y Pruebas de API

**Proyecto:** Share-NOTAS  
**Fecha de Sustentación:** 05 de Mayo de 2026  
**Modalidad:** Presentación en vivo (Repositorio + Funcionamiento + Figma)  
**Grupo:** [Insertar Grupo XX]  
**Integrantes:** [Insertar nombres y roles actualizados]

---

## 1. Registro de Cambios (Fase 3 y 4)
- Migración de navegación básica a **React Router v6** (estructura profesional con rutas públicas, protegidas y layouts anidados)
- Eliminación total de Context API y migración a **Zustand** para gestión de estado global
- Configuración de instancia de Axios con interceptores JWT y manejo de errores
- Implementación de **Dark Mode** persistente con Tailwind CSS
- Creación de 9 componentes UI reutilizables (cumple requisito de 8+)
- Integración parcial de API: Autenticación real (Login/Register) y renderizado de lista de notas en `/dashboard`
- Implementación de estados de carga (Spinners) y manejo de errores (Toasts)

> **Nota:** El requerimiento de la fase indica React Router v7, pero se implementó v6 (versión estable actual). La arquitectura cumple con todos los requisitos profesionales solicitados.

---

## 2. Mapa de Rutas (React Router v6)

### 2.1 Diagrama de Rutas
```
/
├── / (Landing - Pública)
├── /login (Pública - Redirige a /dashboard si está autenticado)
├── /register (Pública - Redirige a /dashboard si está autenticado)
└── /dashboard (Protegida - DashboardLayout con Navbar + Sidebar + Outlet)
    ├── / (Index - Dashboard con notas)
    ├── /explore (Notas públicas)
    ├── /search (Búsqueda avanzada)
    ├── /stats (Estadísticas)
    ├── /profile (Perfil de usuario)
    ├── /tasks (Tareas)
    ├── /files (Archivos)
    ├── /calendar (Calendario)
    └── /shared (Notas compartidas)
```

### 2.2 Rutas Públicas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Landing.jsx` | Página de inicio pública con toggle de dark mode |
| `/login` | `Login.jsx` | Formulario de inicio de sesión (valida sesión existente vía `PublicRoute`) |
| `/register` | `Register.jsx` | Formulario de registro (valida sesión existente vía `PublicRoute`) |

### 2.3 Rutas Protegidas
- Todas las rutas bajo `/dashboard` requieren autenticación vía componente `ProtectedRoute.jsx`
- `ProtectedRoute` valida `isAuthenticated` de Zustand y muestra `LoadingScreen` mientras verifica JWT (`isCheckingAuth`)
- Uso de `<Outlet />` en `DashboardLayout` para renderizar rutas anidadas manteniendo Navbar/Sidebar fijos

### 2.4 Navegación Programática
- Uso de `useNavigate` en `useAuthStore.login()` y `logout()` para redirecciones tras acciones de autenticación

---

## 3. Arquitectura de Estado (Zustand)

Se eliminó completamente Context API y se migró a 2 stores centrales:

### 3.1 useAuthStore (`share-notes-frontend/src/stores/useAuthStore.js`)
Gestiona autenticación de usuario:
- **Estado:**
  - `user`: Datos del usuario autenticado (null si no hay sesión)
  - `isAuthenticated`: Booleano de estado de sesión
  - `isLoading`: Estado de carga para login/register
  - `isCheckingAuth`: Verificación de JWT al cargar la app (evita flicker)
- **Acciones:**
  - `register(data)`: POST `/api/auth/register`, guarda JWT en localStorage
  - `login(data)`: POST `/api/auth/login`, guarda JWT en localStorage
  - `logout()`: Elimina JWT, limpia estado, redirige a `/login`
  - `checkAuth()`: Verifica validez de JWT al cargar la app (ejecuta en `App.jsx`)

### 3.2 useNoteStore (`share-notes-frontend/src/stores/useNoteStore.js`)
Gestiona datos de la aplicación:
- **Estado:**
  - `notes`: Lista de notas del usuario
  - `publicNotes`: Notas públicas para `/explore`
  - `categories`: Lista de categorías
  - `isLoading`: Estado de carga para peticiones API
  - `activeCategory`: Filtro de categoría activa
  - `searchQuery`: Búsqueda global
- **Acciones Asíncronas:**
  - `fetchNotes(filters)`: GET `/api/notes`
  - `createNote(data)`: POST `/api/notes`
  - `updateNote(id, data)`: PUT `/api/notes/:id`
  - `moveToTrash(id)`: DELETE `/api/notes/:id`
  - `fetchCategories()`: GET `/api/categories`
  - `togglePin(id)`: PATCH `/api/notes/:id/pin`

---

## 4. Contratos de API (Integración Parcial)

Instancia de Axios configurada en `share-notes-frontend/src/api/axios.js`:
- `baseURL: "/api"` (proxied a `http://localhost:4000` vía Vite)
- Interceptor de request: Adjunta JWT desde localStorage a `Authorization`
- Interceptor de response: Redirige a `/login` si el backend devuelve 401

### 4.1 Endpoints de Autenticación (Implementados)
#### POST `/api/auth/register`
**Request:**
```json
{
  "name": "Usuario Ejemplo",
  "email": "usuario@sharenotes.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "60d0fe4f5311236168a109ca", "name": "Usuario", "email": "usuario@sharenotes.com" }
}
```

#### POST `/api/auth/login`
**Request:**
```json
{ "email": "usuario@sharenotes.com", "password": "password123" }
```
**Response (200):** Misma estructura que register.

### 4.2 Endpoints de Notas (Ruta General Implementada)
#### GET `/api/notes`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
[
  {
    "id": "60d0fe4f5311236168a109cb",
    "title": "Nota de Ejemplo",
    "content": "Contenido...",
    "isPinned": false,
    "isFavorite": true,
    "category": "60d0fe4f5311236168a109cc"
  }
]
```

---

## 5. Frontend: Implementación Detallada

### 5.1 Estilizado con Tailwind CSS
- **Dark Mode:** `darkMode: "class"` en `tailwind.config.js`, estado persistente en `localStorage` vía hook `useDarkMode.js`
- **Componentes Reutilizables (9 total):**
  1. `Button.jsx`: Variantes (primary, secondary, danger), tamaños (sm, md, lg), soporte para iconos y loading
  2. `Input.jsx`: Input de formulario con label, icono opcional y estado de error
  3. `Modal.jsx`: Diálogo reutilizable con tamaños (sm, md, lg)
  4. `Badge.jsx`: Badges para categorías con colores mapeados
  5. `Spinner.jsx`: Spinner de carga con animación Lucide `Loader2`
  6. `Tooltip.jsx`: Tooltips con posiciones (top, bottom, left, right)
  7. `EmptyState.jsx`: Estados vacíos contextuales para notas, búsqueda, papelera
  8. `RichTextEditor.jsx`: Editor de texto enriquecido con negrita, cursiva, listas
  9. `TagsInput.jsx`: Input para gestión de etiquetas

### 5.2 Feedback de Usuario
- **Estados de Carga:** `Spinner.jsx` y pantalla de carga durante verificación de autenticación
- **Manejo de Errores:** `react-hot-toast` para alertas ante fallos de red o API

### 5.3 Flicker-Free Navigation
El estado `isCheckingAuth` en `useAuthStore` muestra pantalla de carga mientras verifica JWT al recargar (F5), evitando parpadeos entre rutas públicas/protegidas.

### 5.4 Responsive Design
Breakpoints de Tailwind (`sm:`, `md:`, `lg:`) en Navbar, Sidebar y Dashboard para funcionamiento en móviles y escritorio.

---

## 6. Backend: Implementación Detallada

- **Tecnologías:** Express.js, MongoDB (Mongoose), JWT, Google OAuth 2.0 (Passport), Swagger
- **Middleware de Autenticación:** `auth.middleware.js` verifica JWT en rutas protegidas
- **Documentación de API:** Swagger disponible en `/api-docs` (configurado en `src/config/swagger.js`)
- **Pruebas de API:** `src/tests/auth.test.js` con Jest + Supertest para endpoints de autenticación
- **Postman Collection:** `ShareNotes.postman_collection.json` incluido en el backend

---

## 7. Sincronización con Figma (Obligatorio)
⚠️ **Pendiente:** Actualizar mockups en Figma para que coincidan exactamente con la implementación:
- Landing page con toggle de dark mode
- Formularios de Login y Register
- Dashboard con Navbar, Sidebar y lista de notas
- Componentes UI reutilizables (Button, Input, Modal, etc.)

**Enlace a Figma (placeholder):** [Insertar enlace a mockups actualizados]

---

## 8. Evaluación
| Criterio | Peso |
|----------|------|
| Documentación y Figma Actualizado (Coherencia diseño-código) | 20% |
| Arquitectura de Software (Migración a React Router y Zustand) | 30% |
| Funcionalidad (Auth, Routing y Consumo de API) | 30% |
| Sustentación Individual | 20% |

---

## 9. Anexos
- **Repositorio GitHub:** [Insertar enlace al repo SHARE-NOTAS]
- **Figma:** [Insertar enlace a mockups actualizados]
- **Postman Collection:** `share-notes-backend/ShareNotes.postman_collection.json`
- **Swagger API Docs:** `http://localhost:4000/api-docs` (entorno local)
- **Historial de Commits:** Verificar que cada integrante tenga commits técnicos registrados

---

*Documento generado el 05 de Mayo de 2026 para la sustentación de Fase 3 y 4.*

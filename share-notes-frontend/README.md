# 📝 Share Notes – Frontend

Interfaz web de **Share Notes** construida con React 18, React Router v7, Zustand y Tailwind CSS.

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| React | ^18.3 | Librería UI |
| React Router DOM | ^6.24 | Enrutamiento (v7 API) |
| Zustand | ^4.5 | Estado global |
| Axios | ^1.7 | Cliente HTTP |
| Tailwind CSS | ^3.4 | Estilos utilitarios |
| react-hot-toast | ^2.4 | Notificaciones |
| Lucide React | ^0.383 | Iconografía |
| Vite | ^5.3 | Build tool |

## 📂 Estructura

```
src/
├── api/
│   └── axios.js              # Instancia Axios con withCredentials
├── stores/
│   ├── useAuthStore.js       # Zustand: user, login, logout, checkAuth
│   └── useNoteStore.js       # Zustand: CRUD notas y categorías
├── hooks/
│   └── useDarkMode.js        # Toggle dark mode persistente
├── components/
│   ├── ui/                   # Button, Input, Modal, Badge, Spinner, Tooltip
│   ├── layout/               # Navbar, Sidebar, DashboardLayout (<Outlet/>)
│   ├── notes/                # NoteCard, NoteForm
│   └── categories/           # CategoryForm
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
├── routes/
│   └── ProtectedRoute.jsx
├── App.jsx                   # Rutas React Router v7
└── main.jsx
```

## ⚙️ Instalación

```bash
# 1. Entrar a la carpeta
cd share-notes-frontend

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (opcional con proxy Vite)
cp .env.example .env

# 4. Iniciar en desarrollo
npm run dev
```

La app estará en: `http://localhost:5173`

> ⚠️ El backend debe estar corriendo en `http://localhost:4000`

## 🗺️ Mapa de Rutas

| Ruta | Tipo | Componente |
|---|---|---|
| `/` | Pública | Landing |
| `/login` | Pública (redirige si auth) | Login |
| `/register` | Pública (redirige si auth) | Register |
| `/dashboard` | **Protegida** | DashboardLayout → Dashboard |

## 🎨 Componentes Reutilizables (8+)

1. `Button` – variantes: primary, secondary, danger, ghost
2. `Input` – con label, icono y mensaje de error
3. `Modal` – overlay con blur, tamaños sm/md/lg
4. `Badge` – etiqueta de color para categorías
5. `Spinner` – indicador de carga con tamaños
6. `Tooltip` – 4 posiciones
7. `NoteCard` – card con acciones hover
8. `CategoryForm` – formulario con selector de colores

## 🔐 Seguridad

- El token JWT viaja exclusivamente en una **Cookie HTTP-only** (no accesible desde JS).
- `withCredentials: true` en Axios garantiza el envío de la cookie en cada petición.
- `ProtectedRoute` valida la sesión antes de renderizar rutas privadas.
- El script en `index.html` aplica el tema oscuro/claro **antes** del render para evitar flicker.

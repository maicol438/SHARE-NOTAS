# 📝 Share Notes – Backend API

API REST segura para la plataforma **Share Notes**, una aplicación para que estudiantes gestionen notas académicas por categorías.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/share-notes-collection)

---

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| Node.js | ≥ 18.x | Entorno de ejecución |
| Express | ^4.19 | Framework HTTP |
| Mongoose | ^8.4 | ODM para MongoDB |
| MongoDB | Atlas / Local | Base de datos NoSQL |
| JWT (jsonwebtoken) | ^9.0 | Autenticación stateless |
| bcryptjs | ^2.4 | Hash de contraseñas |
| cookie-parser | ^1.4 | Lectura de cookies HTTP-only |
| cors | ^2.8 | Gestión de CORS |
| morgan | ^1.10 | Logger de peticiones HTTP |
| swagger-jsdoc + swagger-ui-express | ^6 / ^5 | Documentación OpenAPI 3.0 |
| dotenv | ^16 | Variables de entorno |
| Jest + Supertest | ^29 / ^7 | Pruebas unitarias e integración |
| nodemon | ^3.1 | Recarga en desarrollo |

---

## 📂 Estructura del Proyecto

```
share-notes-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Conexión MongoDB
│   │   └── swagger.js         # Configuración OpenAPI
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── note.controller.js
│   │   └── category.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js  # Verificación JWT (cookie)
│   │   └── error.middleware.js # Manejador global de errores
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── note.routes.js
│   │   └── category.routes.js
│   ├── tests/
│   │   └── auth.test.js
│   ├── app.js                 # Express app (middlewares + rutas)
│   └── server.js              # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/share-notes-backend.git
cd share-notes-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
MONGO_URI=mongodb://localhost:27017/share_notes
MONGO_URI_TEST=mongodb://localhost:27017/share_notes_test
JWT_SECRET=mi_secreto_seguro_aqui
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Ejecutar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:4000`

---

## 📖 Documentación Swagger

Una vez iniciado el servidor, accede a:

```
http://localhost:4000/api-docs
```

---

## 🧪 Ejecutar Pruebas

```bash
npm test
```

Las pruebas validan:
- ✅ Registro de usuario (201, email duplicado 400)
- ✅ Login correcto (200) e incorrecto (401)
- ✅ Rutas protegidas sin token (401)
- ✅ CRUD de notas con usuario autenticado

---

## 🔗 Endpoints Principales

### Auth
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ |
| GET | `/api/auth/me` | Perfil del usuario | ✅ |

### Notes
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/notes` | Listar notas (con filtros) | ✅ |
| GET | `/api/notes/:id` | Obtener nota por ID | ✅ |
| POST | `/api/notes` | Crear nota | ✅ |
| PUT | `/api/notes/:id` | Actualizar nota | ✅ |
| DELETE | `/api/notes/:id` | Eliminar nota | ✅ |
| PATCH | `/api/notes/:id/pin` | Fijar / desfijar nota | ✅ |

### Categories
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Listar categorías | ✅ |
| POST | `/api/categories` | Crear categoría | ✅ |
| PUT | `/api/categories/:id` | Actualizar categoría | ✅ |
| DELETE | `/api/categories/:id` | Eliminar categoría | ✅ |

---

## 🔐 Seguridad

- **JWT en Cookie HTTP-only**: El token nunca es accesible desde JavaScript del navegador, mitigando ataques XSS.
- **bcryptjs (salt 12)**: Las contraseñas nunca se almacenan en texto plano.
- **CORS configurado**: Solo acepta peticiones del origen definido en `CLIENT_URL`.
- **Validaciones Mongoose**: Todos los modelos validan los datos antes de persistirlos.
- **Índices únicos**: Se previenen duplicados a nivel de base de datos.

---

## 👥 Equipo

| Integrante | Rol |
|---|---|
| — | Scrum Master |
| — | Developer |
| — | Developer |

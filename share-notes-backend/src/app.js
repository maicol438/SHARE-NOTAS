import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { swaggerDocs } from './config/swagger.js';
import { initializeGoogleAuth } from './config/passport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadServiceAccount = () => {
  const pathEnv = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  if (pathEnv && existsSync(pathEnv)) return JSON.parse(readFileSync(pathEnv, 'utf-8'));

  const altPath = join(__dirname, 'service-account.json');
  if (existsSync(altPath)) return JSON.parse(readFileSync(altPath, 'utf-8'));

  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (envJson) return JSON.parse(envJson);

  return null;
};
import authRoutes from './routes/auth.routes.js';
import noteRoutes from './routes/note.routes.js';
import categoryRoutes from './routes/category.routes.js';
import commentRoutes from './routes/comment.routes.js';
import searchRoutes from './routes/search.routes.js';
import profileRoutes from './routes/profile.routes.js';
import notebookRoutes from './routes/notebook.routes.js';
import fileRoutes from './routes/file.routes.js';
import adminRoutes from './routes/admin.routes.js';
import googleDocsRoutes from './routes/googleDocs.routes.js';
import docxExportRoutes from './routes/docxExport.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';

initializeGoogleAuth();

const app = express();

app.set('trust proxy', 1);

// ── Health Check (ANTES de middlewares de seguridad) ────
app.get('/api/health', (_req, res) => {
  let googleDocsStatus = 'no configurado';
  try {
    const creds = loadServiceAccount();
    if (creds) {
      googleDocsStatus = creds.private_key?.includes('BEGIN PRIVATE KEY')
        ? `configurado (${creds.client_email})`
        : 'configurado pero private_key inválida';
    }
  } catch {
    googleDocsStatus = 'configurado pero JSON inválido';
  }
  res.json({
    status: 'OK',
    message: 'Share Notes API is running 🚀',
    features: {
      googleAuth: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      googleDocs: googleDocsStatus,
    },
  });
});

// ── Rate Limiter global (después de health, antes de todo lo demás) ──
app.use(generalLimiter);

// ── Middlewares globales ──────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://share-notas.vercel.app',
  'https://share-notas-6skqlt2or-maicol438s-projects.vercel.app',
  'https://share-notas-frontend.onrender.com',
  'https://share-notas-api.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan('dev'));

// ── Favicon ────────────────────────────────────────────────
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// ── Swagger ───────────────────────────────────────────────
swaggerDocs(app);

// ── Rutas API ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', commentRoutes);
app.use('/api', searchRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', googleDocsRoutes);
app.use('/api', docxExportRoutes);

// ── Ruta raíz ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.get('/api/debug/google-test', async (_req, res) => {
  let credentials;
  try {
    credentials = loadServiceAccount();
  } catch (e) {
    return res.json({ ok: false, error: 'Error al cargar credenciales: ' + e.message });
  }

  if (!credentials) {
    return res.json({
      ok: false,
      error: 'No se encontraron credenciales. Crea src/service-account.json o define GOOGLE_SERVICE_ACCOUNT_JSON/GOOGLE_SERVICE_ACCOUNT_PATH',
    });
  }

  if (!credentials.private_key?.includes('BEGIN PRIVATE KEY')) {
    return res.json({ ok: false, error: 'private_key no contiene BEGIN PRIVATE KEY' });
  }

  try {
    const { google } = await import('googleapis');
    const auth = google.auth.fromJSON({
      type: 'service_account',
      client_email: credentials.client_email,
      private_key: credentials.private_key,
      private_key_id: credentials.private_key_id,
      project_id: credentials.project_id,
    });
    auth.scopes = ['https://www.googleapis.com/auth/documents'];
    const token = await auth.getAccessToken();
    res.json({
      ok: true,
      email: credentials.client_email,
      token_obtenido: !!token,
    });
  } catch (e) {
    res.json({
      ok: false,
      error: e.message,
      detalle: e.response?.data?.error || 'sin detalle adicional',
    });
  }
});

// ── Manejador global de errores ───────────────────────────
app.use(errorHandler);

export default app;

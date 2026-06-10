import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socket.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
    console.log('🔌 WebSocket server initialized');
  });
};

startServer();
